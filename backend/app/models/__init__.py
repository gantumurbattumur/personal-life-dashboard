"""Import all models so Alembic autogenerate discovers them."""

from .base import Base  # noqa: F401
from .bronze import RawAppleHealthRecord, RawFinance, RawHealth, RawLocation, RawMedia  # noqa: F401
from .gold import GoldDailySummary, GoldGymWeeklyVolume, GoldMonthlyFinance  # noqa: F401
from .silver import (  # noqa: F401
    BodyMetric,
    Goal,
    Habit,
    HealthMetric,
    LocationPing,
    MediaLog,
    RecoveryDaily,
    SleepDailySummary,
    SleepSession,
    SleepStage,
    Transaction,
    WorkoutDailySummary,
    WorkoutSession,
)
