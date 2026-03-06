import uuid
from datetime import date, datetime

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


class WorkoutDailySummaryOut(BaseModel):
    date: date
    workouts_count: int
    total_duration_min: int
    total_calories_burned: float
    training_load: float

    model_config = {"from_attributes": True}


class WorkoutKpiOut(BaseModel):
    days: int
    workouts_count: int
    total_duration_min: int
    avg_duration_min: float
    total_calories_burned: float
    consistency_pct: float


class WorkoutWeeklyVolumeOut(BaseModel):
    week_start: date
    workouts_count: int
    total_duration_min: int
    total_calories_burned: float
    training_load: float

    model_config = {"from_attributes": True}
