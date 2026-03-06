from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.silver import RecoveryDaily, SleepDailySummary, SleepSession, SleepStage
from app.schemas.sleep import (
    RecoveryDailyOut,
    SleepDailySummaryOut,
    SleepSessionOut,
    SleepStageOut,
)

router = APIRouter()


@router.get("/sessions", response_model=list[SleepSessionOut])
async def get_sleep_sessions(
    days: int = Query(default=30, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(SleepSession)
        .where(SleepSession.start_at >= cutoff)
        .order_by(SleepSession.start_at.desc())
    )
    return result.scalars().all()


@router.get("/sessions/{session_id}/stages", response_model=list[SleepStageOut])
async def get_sleep_stages(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SleepStage)
        .where(SleepStage.sleep_session_id == session_id)
        .order_by(SleepStage.start_at)
    )
    return result.scalars().all()


@router.get("/daily", response_model=list[SleepDailySummaryOut])
async def get_sleep_daily(
    days: int = Query(default=30, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    result = await db.execute(
        select(SleepDailySummary)
        .where(SleepDailySummary.date >= cutoff)
        .order_by(SleepDailySummary.date.desc())
    )
    return result.scalars().all()


@router.get("/recovery", response_model=list[RecoveryDailyOut])
async def get_recovery_daily(
    days: int = Query(default=30, ge=1, le=3650),
    db: AsyncSession = Depends(get_db),
):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    result = await db.execute(
        select(RecoveryDaily)
        .where(RecoveryDaily.date >= cutoff)
        .order_by(RecoveryDaily.date.desc())
    )
    return result.scalars().all()
