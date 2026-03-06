from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.silver import WorkoutSession
from app.schemas.workouts import WorkoutSessionOut

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
