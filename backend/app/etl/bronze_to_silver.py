"""ETL: Bronze → Silver transformations.

Each function reads unprocessed Bronze rows, parses JSONB payloads
into typed Silver table rows, and marks the Bronze row as processed.
"""

from collections import defaultdict
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bronze import (
    RawAppleHealthRecord,
    RawFinance,
    RawHealth,
    RawLocation,
    RawMedia,
)
from app.models.silver import (
    HealthMetric,
    LocationPing,
    MediaLog,
    RecoveryDaily,
    SleepDailySummary,
    SleepSession,
    SleepStage,
    Transaction,
    WorkoutSession,
)


async def transform_health(session: AsyncSession) -> int:
    """Parse Apple Health Auto Export JSONB into health_metrics rows."""
    result = await session.execute(
        select(RawHealth).where(RawHealth.processed_at.is_(None))
    )
    raw_rows = result.scalars().all()

    count = 0
    for raw in raw_rows:
        payload = raw.payload
        data = payload.get("data", {})
        metrics = data.get("metrics", [])

        # Aggregate by date
        daily: dict[str, dict] = {}

        for metric in metrics:
            name = metric.get("name", "")
            for entry in metric.get("data", []):
                date_str = entry.get("date", "")[:10]  # 'YYYY-MM-DD'
                if not date_str:
                    continue

                if date_str not in daily:
                    daily[date_str] = {"steps": 0, "sleep_minutes": 0, "resting_hr": 0, "active_calories": 0}

                qty = entry.get("qty", 0) or 0

                if name == "step_count":
                    daily[date_str]["steps"] += int(qty)
                elif name == "sleep_analysis":
                    # Duration in minutes
                    daily[date_str]["sleep_minutes"] += int(qty)
                elif name == "resting_heart_rate":
                    daily[date_str]["resting_hr"] = int(qty)
                elif name == "active_energy":
                    daily[date_str]["active_calories"] += int(qty)

        for date_str, vals in daily.items():
            metric_row = HealthMetric(
                date=date.fromisoformat(date_str),
                steps=vals["steps"],
                sleep_minutes=vals["sleep_minutes"],
                resting_hr=vals["resting_hr"],
                active_calories=vals["active_calories"],
            )
            session.add(metric_row)
            count += 1

        raw.processed_at = datetime.now(timezone.utc)

    return count


async def transform_finance(session: AsyncSession) -> int:
    """Parse CSV-imported finance rows into transactions."""
    result = await session.execute(
        select(RawFinance).where(RawFinance.processed_at.is_(None))
    )
    raw_rows = result.scalars().all()

    count = 0
    for raw in raw_rows:
        payload = raw.payload

        # Try common CSV column names
        date_str = payload.get("Date", payload.get("date", ""))
        amount_str = payload.get("Amount", payload.get("amount", "0"))
        category = payload.get("Category", payload.get("category", "uncategorized"))
        merchant = payload.get("Description", payload.get("Merchant", payload.get("merchant", "")))

        try:
            amount = float(str(amount_str).replace(",", "").replace("$", ""))
            txn_date = date.fromisoformat(date_str[:10])
        except (ValueError, TypeError):
            raw.processed_at = datetime.now(timezone.utc)
            continue

        is_expense = amount < 0
        txn = Transaction(
            date=txn_date,
            amount=abs(amount),
            category=category,
            merchant=merchant,
            is_expense=is_expense,
        )
        session.add(txn)
        count += 1
        raw.processed_at = datetime.now(timezone.utc)

    return count


async def transform_media(session: AsyncSession) -> int:
    """Parse Letterboxd diary entries into media_logs."""
    result = await session.execute(
        select(RawMedia).where(RawMedia.processed_at.is_(None))
    )
    raw_rows = result.scalars().all()

    count = 0
    for raw in raw_rows:
        payload = raw.payload

        title = payload.get("Name", payload.get("name", "Unknown"))
        rating_str = payload.get("Rating", "")
        watched_date_str = payload.get("Watched Date", payload.get("Date", ""))

        try:
            rating = float(rating_str) if rating_str else None
        except (ValueError, TypeError):
            rating = None

        try:
            consumed_at = date.fromisoformat(watched_date_str[:10])
        except (ValueError, TypeError):
            consumed_at = date.today()

        log = MediaLog(
            media_type="movie",
            title=title,
            rating=rating,
            consumed_at=consumed_at,
        )
        session.add(log)
        count += 1
        raw.processed_at = datetime.now(timezone.utc)

    return count


async def transform_location(session: AsyncSession) -> int:
    """Parse OwnTracks payloads into location_pings."""
    result = await session.execute(
        select(RawLocation).where(RawLocation.processed_at.is_(None))
    )
    raw_rows = result.scalars().all()

    count = 0
    for raw in raw_rows:
        payload = raw.payload

        if payload.get("_type") != "location":
            raw.processed_at = datetime.now(timezone.utc)
            continue

        lat = payload.get("lat")
        lon = payload.get("lon")
        tst = payload.get("tst")

        if lat is None or lon is None or tst is None:
            raw.processed_at = datetime.now(timezone.utc)
            continue

        ping = LocationPing(
            timestamp=datetime.fromtimestamp(tst, tz=timezone.utc),
            lat=float(lat),
            lng=float(lon),
            accuracy=payload.get("acc"),
        )
        session.add(ping)
        count += 1
        raw.processed_at = datetime.now(timezone.utc)

    return count


async def transform_apple_health_records(session: AsyncSession) -> int:
    """Parse normalized Apple Health raw records into sleep/workout silver tables."""
    result = await session.execute(
        select(RawAppleHealthRecord).where(RawAppleHealthRecord.processed_at.is_(None))
    )
    raw_rows = result.scalars().all()

    count = 0
    for raw in raw_rows:
        if raw.record_type == "sleep_session":
            exists = await session.scalar(
                select(SleepSession.id).where(SleepSession.raw_record_id == raw.id)
            )
            if not exists and raw.start_at and raw.end_at:
                metadata = raw.payload.get("metadata", {})
                duration_min = int((raw.end_at - raw.start_at).total_seconds() // 60)
                sleep = SleepSession(
                    source=raw.source,
                    start_at=raw.start_at,
                    end_at=raw.end_at,
                    duration_min=max(duration_min, 0),
                    time_in_bed_min=metadata.get("time_in_bed_min"),
                    bedtime=raw.start_at,
                    wake_time=raw.end_at,
                    raw_record_id=raw.id,
                )
                session.add(sleep)
                count += 1

        elif raw.record_type == "sleep_stage":
            metadata = raw.payload.get("metadata", {})
            session_source_record_id = metadata.get("session_source_record_id")
            if raw.start_at and raw.end_at and session_source_record_id:
                parent_raw_id = await session.scalar(
                    select(RawAppleHealthRecord.id).where(
                        RawAppleHealthRecord.source == raw.source,
                        RawAppleHealthRecord.source_record_id == session_source_record_id,
                    )
                )
                if parent_raw_id:
                    parent_session_id = await session.scalar(
                        select(SleepSession.id).where(SleepSession.raw_record_id == parent_raw_id)
                    )
                    if parent_session_id:
                        stage_exists = await session.scalar(
                            select(SleepStage.id).where(
                                SleepStage.sleep_session_id == parent_session_id,
                                SleepStage.stage_name == (raw.value_text or "core"),
                                SleepStage.start_at == raw.start_at,
                                SleepStage.end_at == raw.end_at,
                            )
                        )
                        if not stage_exists:
                            stage_duration = int((raw.end_at - raw.start_at).total_seconds() // 60)
                            session.add(
                                SleepStage(
                                    sleep_session_id=parent_session_id,
                                    stage_name=(raw.value_text or "core").lower(),
                                    start_at=raw.start_at,
                                    end_at=raw.end_at,
                                    duration_min=max(stage_duration, 0),
                                )
                            )
                            count += 1

        elif raw.record_type == "time_in_bed":
            if raw.start_at and raw.end_at and raw.value_num is not None:
                matching_session_id = await session.scalar(
                    select(SleepSession.id).where(
                        SleepSession.source == raw.source,
                        SleepSession.start_at == raw.start_at,
                        SleepSession.end_at == raw.end_at,
                    )
                )
                if matching_session_id:
                    matching_session = await session.get(SleepSession, matching_session_id)
                    if matching_session and matching_session.time_in_bed_min is None:
                        matching_session.time_in_bed_min = int(raw.value_num)

        elif raw.record_type == "workout":
            exists = await session.scalar(
                select(WorkoutSession.id).where(
                    WorkoutSession.source == raw.source,
                    WorkoutSession.started_at == raw.start_at,
                    WorkoutSession.ended_at == raw.end_at,
                    WorkoutSession.workout_type == raw.value_text,
                )
            )
            if not exists and raw.start_at:
                duration_min = None
                if raw.end_at:
                    duration_min = int((raw.end_at - raw.start_at).total_seconds() // 60)
                session.add(
                    WorkoutSession(
                        source=raw.source,
                        started_at=raw.start_at,
                        ended_at=raw.end_at,
                        duration_min=duration_min,
                        workout_type=raw.value_text,
                        calories_burned=float(raw.value_num) if raw.value_num is not None else None,
                    )
                )
                count += 1

        raw.processed_at = datetime.now(timezone.utc)

    return count


async def build_sleep_and_recovery_daily(session: AsyncSession) -> int:
    """Build sleep_daily_summary and recovery_daily from Silver sleep/workout + heart metrics."""
    session_rows = (
        await session.execute(
            select(SleepSession).order_by(SleepSession.start_at.asc())
        )
    ).scalars().all()

    if not session_rows:
        return 0

    session_ids = [row.id for row in session_rows]
    stage_rows = (
        await session.execute(
            select(SleepStage).where(SleepStage.sleep_session_id.in_(session_ids))
        )
    ).scalars().all()

    stage_map: dict[str, dict[str, int]] = defaultdict(lambda: {"deep": 0, "rem": 0, "awake": 0})
    for stage in stage_rows:
        stage_name = (stage.stage_name or "").lower()
        if stage_name in {"deep", "rem", "awake"}:
            stage_map[str(stage.sleep_session_id)][stage_name] += stage.duration_min

    workout_rows = (
        await session.execute(select(WorkoutSession).where(WorkoutSession.started_at.is_not(None)))
    ).scalars().all()
    workout_load_by_day: dict[date, int] = defaultdict(int)
    for workout in workout_rows:
        workout_load_by_day[workout.started_at.date()] += workout.duration_min or 0

    raw_hr_rows = (
        await session.execute(
            select(RawAppleHealthRecord).where(
                RawAppleHealthRecord.record_type.in_([
                    "resting_heart_rate",
                    "heart_rate_variability",
                ]),
                RawAppleHealthRecord.value_num.is_not(None),
            )
        )
    ).scalars().all()

    rhr_values_by_day: dict[date, list[float]] = defaultdict(list)
    hrv_values_by_day: dict[date, list[float]] = defaultdict(list)
    for raw in raw_hr_rows:
        timestamp = raw.recorded_at or raw.start_at
        if not timestamp:
            continue
        if raw.record_type == "resting_heart_rate":
            rhr_values_by_day[timestamp.date()].append(raw.value_num or 0.0)
        elif raw.record_type == "heart_rate_variability":
            hrv_values_by_day[timestamp.date()].append(raw.value_num or 0.0)

    sessions_by_day: dict[date, list[SleepSession]] = defaultdict(list)
    for row in session_rows:
        sessions_by_day[row.start_at.date()].append(row)

    days_sorted = sorted(sessions_by_day.keys())
    prior_bedtimes: list[int] = []
    changed = 0

    for day in days_sorted:
        sessions = sessions_by_day[day]
        total_sleep_min = sum(item.duration_min for item in sessions)
        total_time_in_bed_min = sum(item.time_in_bed_min or item.duration_min for item in sessions)
        bedtime = min(item.start_at for item in sessions)
        wake_time = max(item.end_at for item in sessions)

        deep_sleep_min = 0
        rem_sleep_min = 0
        awake_min = 0
        for item in sessions:
            summary = stage_map.get(str(item.id), {})
            deep_sleep_min += summary.get("deep", 0)
            rem_sleep_min += summary.get("rem", 0)
            awake_min += summary.get("awake", 0)

        sleep_efficiency = None
        if total_time_in_bed_min > 0:
            sleep_efficiency = round((total_sleep_min / total_time_in_bed_min) * 100, 2)

        bedtime_minutes = bedtime.hour * 60 + bedtime.minute
        if prior_bedtimes:
            baseline_bedtime = sum(prior_bedtimes[-7:]) / min(len(prior_bedtimes), 7)
            delta = abs(bedtime_minutes - baseline_bedtime)
            delta = min(delta, 240)
            bedtime_consistency_score = round(max(0.0, 100.0 - (delta / 240 * 100.0)), 2)
        else:
            bedtime_consistency_score = 100.0
        prior_bedtimes.append(bedtime_minutes)

        duration_component = min(total_sleep_min / 480, 1.0) * 45
        efficiency_component = min((sleep_efficiency or 0.0) / 95, 1.0) * 25
        stage_ratio = ((deep_sleep_min + rem_sleep_min) / total_sleep_min) if total_sleep_min else 0.0
        stage_component = min(stage_ratio / 0.4, 1.0) * 20
        consistency_component_score = min(bedtime_consistency_score / 100, 1.0) * 10
        sleep_score = round(duration_component + efficiency_component + stage_component + consistency_component_score, 2)

        existing_summary = await session.scalar(
            select(SleepDailySummary).where(SleepDailySummary.date == day)
        )
        if existing_summary:
            existing_summary.total_sleep_min = total_sleep_min
            existing_summary.total_time_in_bed_min = total_time_in_bed_min
            existing_summary.deep_sleep_min = deep_sleep_min
            existing_summary.rem_sleep_min = rem_sleep_min
            existing_summary.awake_min = awake_min
            existing_summary.sleep_efficiency = sleep_efficiency
            existing_summary.bedtime = bedtime
            existing_summary.wake_time = wake_time
            existing_summary.bedtime_consistency_score = bedtime_consistency_score
            existing_summary.sleep_score = sleep_score
        else:
            session.add(
                SleepDailySummary(
                    date=day,
                    total_sleep_min=total_sleep_min,
                    total_time_in_bed_min=total_time_in_bed_min,
                    deep_sleep_min=deep_sleep_min,
                    rem_sleep_min=rem_sleep_min,
                    awake_min=awake_min,
                    sleep_efficiency=sleep_efficiency,
                    bedtime=bedtime,
                    wake_time=wake_time,
                    bedtime_consistency_score=bedtime_consistency_score,
                    sleep_score=sleep_score,
                    source_priority="apple_health",
                )
            )
        changed += 1

        sleep_component = min(total_sleep_min / 480, 1.0) * 50
        consistency_component = min(bedtime_consistency_score / 100, 1.0) * 20

        prev_training = workout_load_by_day.get(day, 0)
        training_load_component = max(0.0, 20.0 - min(prev_training, 120) / 6)

        rhr_today_values = rhr_values_by_day.get(day, [])
        rhr_baseline_values = []
        for lookback_day, values in rhr_values_by_day.items():
            if 0 < (day - lookback_day).days <= 30:
                rhr_baseline_values.extend(values)
        rhr_today = (sum(rhr_today_values) / len(rhr_today_values)) if rhr_today_values else None
        rhr_baseline = (sum(rhr_baseline_values) / len(rhr_baseline_values)) if rhr_baseline_values else None
        if rhr_today is None or rhr_baseline is None:
            rhr_component = 15.0
        else:
            deviation = max(0.0, rhr_today - rhr_baseline)
            rhr_component = max(0.0, 15.0 - min(deviation, 10.0) * 1.5)

        hrv_today_values = hrv_values_by_day.get(day, [])
        hrv_baseline_values = []
        for lookback_day, values in hrv_values_by_day.items():
            if 0 < (day - lookback_day).days <= 30:
                hrv_baseline_values.extend(values)
        hrv_today = (sum(hrv_today_values) / len(hrv_today_values)) if hrv_today_values else None
        hrv_baseline = (sum(hrv_baseline_values) / len(hrv_baseline_values)) if hrv_baseline_values else None
        if hrv_today is None or hrv_baseline is None:
            hrv_component = 15.0
        else:
            ratio = hrv_today / hrv_baseline if hrv_baseline > 0 else 1.0
            hrv_component = max(0.0, min(ratio, 1.2) / 1.2 * 15.0)

        recovery_score = round(
            sleep_component
            + consistency_component
            + training_load_component
            + rhr_component
            + hrv_component,
            2,
        )

        existing_recovery = await session.scalar(
            select(RecoveryDaily).where(RecoveryDaily.date == day)
        )
        explanation = (
            f"Sleep {total_sleep_min}m, consistency {round(bedtime_consistency_score, 1)}%, "
            f"training load {prev_training}m, recovery score {recovery_score}."
        )
        if existing_recovery:
            existing_recovery.recovery_score = recovery_score
            existing_recovery.sleep_component = round(sleep_component, 2)
            existing_recovery.consistency_component = round(consistency_component, 2)
            existing_recovery.training_load_component = round(training_load_component, 2)
            existing_recovery.rhr_component = round(rhr_component, 2)
            existing_recovery.hrv_component = round(hrv_component, 2)
            existing_recovery.explanation = explanation
        else:
            session.add(
                RecoveryDaily(
                    date=day,
                    recovery_score=recovery_score,
                    sleep_component=round(sleep_component, 2),
                    consistency_component=round(consistency_component, 2),
                    training_load_component=round(training_load_component, 2),
                    rhr_component=round(rhr_component, 2),
                    hrv_component=round(hrv_component, 2),
                    explanation=explanation,
                )
            )

    return changed
