"""ETL: Bronze → Silver transformations.

Each function reads unprocessed Bronze rows, parses JSONB payloads
into typed Silver table rows, and marks the Bronze row as processed.
"""

from datetime import date, datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bronze import RawFinance, RawHealth, RawLocation, RawMedia
from app.models.silver import HealthMetric, LocationPing, MediaLog, Transaction


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
