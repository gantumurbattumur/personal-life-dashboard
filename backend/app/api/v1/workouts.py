from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gold import GoldGymWeeklyVolume
from app.models.silver import WorkoutDailySummary, WorkoutSession
from app.schemas.workouts import (
    WorkoutDailySummaryOut,
    WorkoutKpiOut,
    WorkoutSessionOut,
    WorkoutWeeklyVolumeOut,
)

router = APIRouter()


@router.get("/sessions", response_model=list[WorkoutSessionOut])
async def get_workout_sessions(
    days: int = Query(default=90, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(WorkoutSession)
        .where(WorkoutSession.started_at >= cutoff)
        .order_by(WorkoutSession.started_at.desc())
    )
    return result.scalars().all()


@router.get("/daily", response_model=list[WorkoutDailySummaryOut])
async def get_workout_daily_summary(
    days: int = Query(default=30, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    result = await db.execute(
        select(WorkoutDailySummary)
        .where(WorkoutDailySummary.date >= cutoff)
        .order_by(WorkoutDailySummary.date.desc())
    )
    return result.scalars().all()


@router.get("/kpi", response_model=WorkoutKpiOut)
async def get_workout_kpis(
    days: int = Query(default=30, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    session_rows = (
        await db.execute(
            select(WorkoutSession).where(WorkoutSession.started_at >= cutoff)
        )
    ).scalars().all()

    workouts_count = len(session_rows)
    total_duration_min = sum(item.duration_min or 0 for item in session_rows)
    total_calories_burned = float(sum(item.calories_burned or 0 for item in session_rows))
    avg_duration_min = (total_duration_min / workouts_count) if workouts_count else 0.0

    active_days = len({item.started_at.date() for item in session_rows})
    consistency_pct = (active_days / days) * 100 if days else 0.0

    return WorkoutKpiOut(
        days=days,
        workouts_count=workouts_count,
        total_duration_min=total_duration_min,
        avg_duration_min=round(avg_duration_min, 2),
        total_calories_burned=round(total_calories_burned, 2),
        consistency_pct=round(consistency_pct, 2),
    )


@router.get("/weekly-volume", response_model=list[WorkoutWeeklyVolumeOut])
async def get_weekly_workout_volume(
    weeks: int = Query(default=12, ge=1, le=104),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GoldGymWeeklyVolume)
        .order_by(GoldGymWeeklyVolume.week_start.desc())
        .limit(weeks)
    )
    return result.scalars().all()
