"""Import all models so Alembic autogenerate discovers them."""

from .base import Base  # noqa: F401
from .bronze import RawFinance, RawHealth, RawLocation, RawMedia  # noqa: F401
from .gold import GoldDailySummary, GoldMonthlyFinance  # noqa: F401
from .silver import (  # noqa: F401
    Goal,
    Habit,
    HealthMetric,
    LocationPing,
    MediaLog,
    Transaction,
)
