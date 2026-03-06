"""Pydantic schemas for Silver (clean) data."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel


class HealthMetricOut(BaseModel):
    id: uuid.UUID
    date: date
    steps: int
    sleep_minutes: int
    resting_hr: int
    active_calories: int

    model_config = {"from_attributes": True}


class TransactionOut(BaseModel):
    id: uuid.UUID
    date: date
    amount: float
    category: str
    merchant: str
    is_expense: bool

    model_config = {"from_attributes": True}


class MediaLogOut(BaseModel):
    id: uuid.UUID
    media_type: str
    title: str
    rating: float | None
    consumed_at: date

    model_config = {"from_attributes": True}


class LocationPingOut(BaseModel):
    id: uuid.UUID
    timestamp: datetime
    lat: float
    lng: float
    accuracy: float | None

    model_config = {"from_attributes": True}


class GoalOut(BaseModel):
    id: uuid.UUID
    title: str
    target: float
    current: float
    unit: str
    deadline: date
    progress_pct: float = 0.0

    model_config = {"from_attributes": True}

    @classmethod
    def from_goal(cls, goal):
        pct = (goal.current / goal.target * 100) if goal.target > 0 else 0
        return cls(
            id=goal.id,
            title=goal.title,
            target=goal.target,
            current=goal.current,
            unit=goal.unit,
            deadline=goal.deadline,
            progress_pct=round(pct, 1),
        )


class HabitOut(BaseModel):
    id: uuid.UUID
    name: str
    streak: int
    last_completed: date | None
    is_active: bool

    model_config = {"from_attributes": True}
