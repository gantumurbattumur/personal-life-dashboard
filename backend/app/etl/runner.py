"""ETL Runner — orchestrates Bronze→Silver→Gold pipeline.

Usage:
    python -m app.etl.runner
"""

import asyncio
import logging

from app.database import async_session_factory
from app.etl.bronze_to_silver import (
    build_workout_daily_summary,
    build_sleep_and_recovery_daily,
    transform_apple_health_records,
    transform_finance,
    transform_health,
    transform_location,
    transform_media,
)
from app.etl.silver_to_gold import refresh_gold_views

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


async def run_etl() -> None:
    logger.info("Starting ETL pipeline...")

    async with async_session_factory() as session:
        # Bronze → Silver
        health_count = await transform_health(session)
        logger.info(f"Health: {health_count} rows transformed")

        apple_health_count = await transform_apple_health_records(session)
        logger.info(f"Apple Health normalized: {apple_health_count} rows transformed")

        sleep_summary_count = await build_sleep_and_recovery_daily(session)
        logger.info(f"Sleep/recovery daily summaries built: {sleep_summary_count}")

        workout_summary_count = await build_workout_daily_summary(session)
        logger.info(f"Workout daily summaries built: {workout_summary_count}")

        finance_count = await transform_finance(session)
        logger.info(f"Finance: {finance_count} rows transformed")

        media_count = await transform_media(session)
        logger.info(f"Media: {media_count} rows transformed")

        location_count = await transform_location(session)
        logger.info(f"Location: {location_count} rows transformed")

        await session.commit()

        # Silver → Gold
        await refresh_gold_views(session)
        await session.commit()

        total = (
            health_count
            + apple_health_count
            + sleep_summary_count
            + workout_summary_count
            + finance_count
            + media_count
            + location_count
        )
        logger.info(f"ETL complete. Total rows transformed: {total}")


if __name__ == "__main__":
    asyncio.run(run_etl())
