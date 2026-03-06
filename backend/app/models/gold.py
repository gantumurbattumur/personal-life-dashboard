"""Gold layer — materialized view ORM mappings (read-only).

The actual views are created by Alembic migrations.
These models let SQLAlchemy query them like regular tables.
"""

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class GoldDailySummary(Base):
    """Materialized view: one row per day with aggregated stats."""

    __tablename__ = "gold_daily_summary"
    __table_args__ = {"info": {"is_view": True}}

    day: Mapped[date] = mapped_column(Date, primary_key=True)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    sleep_minutes: Mapped[int] = mapped_column(Integer, default=0)
    resting_hr: Mapped[int] = mapped_column(Integer, default=0)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0)
    total_income: Mapped[float] = mapped_column(Float, default=0.0)
    habits_completed: Mapped[int] = mapped_column(Integer, default=0)


class GoldMonthlyFinance(Base):
    """Materialized view: monthly income vs expenses."""

    __tablename__ = "gold_monthly_finance"
    __table_args__ = {"info": {"is_view": True}}

    month: Mapped[str] = mapped_column(String(7), primary_key=True)  # 'YYYY-MM'
    income: Mapped[float] = mapped_column(Float, default=0.0)
    expenses: Mapped[float] = mapped_column(Float, default=0.0)


class GoldGymWeeklyVolume(Base):
    """Materialized view: weekly workout volume and load."""

    __tablename__ = "gold_gym_weekly_volume"
    __table_args__ = {"info": {"is_view": True}}

    week_start: Mapped[date] = mapped_column(Date, primary_key=True)
    workouts_count: Mapped[int] = mapped_column(Integer, default=0)
    total_duration_min: Mapped[int] = mapped_column(Integer, default=0)
    total_calories_burned: Mapped[float] = mapped_column(Float, default=0.0)
    training_load: Mapped[float] = mapped_column(Float, default=0.0)
