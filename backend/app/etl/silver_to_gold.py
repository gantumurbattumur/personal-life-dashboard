"""ETL: Silver → Gold — refresh materialized views."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def refresh_gold_views(session: AsyncSession) -> None:
    """Refresh all Gold materialized views.

    Uses CONCURRENTLY so readers are not blocked during refresh.
    Requires unique indexes (created in migration 002).
    """
    await session.execute(
        text("REFRESH MATERIALIZED VIEW CONCURRENTLY gold_daily_summary")
    )
    await session.execute(
        text("REFRESH MATERIALIZED VIEW CONCURRENTLY gold_monthly_finance")
    )
