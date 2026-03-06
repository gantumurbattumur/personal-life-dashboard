import uuid
from datetime import datetime

from pydantic import BaseModel


class WorkoutSessionOut(BaseModel):
    id: uuid.UUID
    source: str
    started_at: datetime
    ended_at: datetime | None
    duration_min: int | None
    workout_type: str | None
    location: str | None
    notes: str | None
    session_rpe: float | None
    calories_burned: float | None
    avg_heart_rate: float | None

    model_config = {"from_attributes": True}
