"""Pydantic schemas for Gold (aggregated) endpoints."""

from datetime import date

from pydantic import BaseModel


class DailySummaryOut(BaseModel):
    day: date
    total_steps: int
    sleep_minutes: int
    resting_hr: int
    total_spent: float
    total_income: float
    habits_completed: int

    model_config = {"from_attributes": True}


class MonthlyFinanceOut(BaseModel):
    month: str
    income: float
    expenses: float

    model_config = {"from_attributes": True}


class TodayDashboardOut(BaseModel):
    date: date
    steps: int
    sleep_minutes: int
    resting_hr: int
    total_spent: float
    total_income: float
    habits_done: int
    habits_total: int


class MapPointOut(BaseModel):
    lat: float
    lng: float
    timestamp: str  # ISO format string for JSON


class HabitCalendarDay(BaseModel):
    date: date
    habits_completed: int
