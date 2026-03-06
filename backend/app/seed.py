"""Seed script — populates Silver tables with ~30 days of realistic demo data.

Inserts directly into Silver tables (bypasses Bronze for speed),
then refreshes Gold materialized views.

Usage:
    python -m app.seed
"""

import asyncio
import logging
import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.silver import (
    Goal,
    Habit,
    HealthMetric,
    LocationPing,
    MediaLog,
    Transaction,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Reproducible randomness
random.seed(42)

TODAY = date.today()

# --- Location clusters (city, lat, lng, radius) ---
CITIES = [
    ("Ulaanbaatar", 47.9184, 106.9177, 0.03),
    ("Seoul", 37.5665, 126.9780, 0.04),
    ("Tokyo", 35.6762, 139.6503, 0.05),
    ("San Francisco", 37.7749, -122.4194, 0.04),
]

EXPENSE_CATEGORIES = [
    ("groceries", ["Nomin Supermarket", "CU Mart", "Whole Foods", "E-Mart"]),
    ("dining", ["Blue Sky Lounge", "Seoul BBQ", "Ramen House", "Taco Bell"]),
    ("transport", ["Uber", "Metro Card", "Gas Station", "Bolt"]),
    ("entertainment", ["Netflix", "Spotify", "Cinema", "Steam"]),
    ("utilities", ["Electric Bill", "Water Bill", "Internet", "Phone"]),
    ("shopping", ["Amazon", "Uniqlo", "Apple Store", "Nike"]),
]

MOVIES = [
    ("Dune: Part Two", 4.5, "2026-02-05"),
    ("Oppenheimer", 4.0, "2026-02-08"),
    ("Poor Things", 3.5, "2026-02-12"),
    ("The Holdovers", 4.0, "2026-02-15"),
    ("Past Lives", 4.5, "2026-02-18"),
    ("Killers of the Flower Moon", 3.5, "2026-02-20"),
    ("Anatomy of a Fall", 4.0, "2026-02-22"),
    ("The Zone of Interest", 3.0, "2026-02-25"),
    ("Saltburn", 3.5, "2026-02-27"),
    ("All of Us Strangers", 4.0, "2026-03-01"),
    ("The Iron Claw", 3.5, "2026-03-02"),
    ("May December", 3.0, "2026-03-03"),
    ("Maestro", 3.5, "2026-03-04"),
    ("Ferrari", 3.0, "2026-03-05"),
    ("Napoleon", 2.5, "2026-03-06"),
]

GOAL_TEMPLATES = [
    ("Save $10,000", 10000, 4200, "$", "2026-12-31"),
    ("Read 24 books", 24, 5, "books", "2026-12-31"),
    ("Run 500 km", 500, 120, "km", "2026-12-31"),
    ("Learn 1000 vocab words", 1000, 340, "words", "2026-12-31"),
    ("Meditate 200 days", 200, 55, "days", "2026-12-31"),
]

HABIT_NAMES = [
    ("Morning meditation", 12),
    ("Exercise 30 min", 8),
    ("Read 20 pages", 15),
    ("Journal", 5),
    ("No social media before noon", 3),
]


async def seed_health(session: AsyncSession) -> None:
    """Generate 30 days of health metrics."""
    for i in range(30):
        d = TODAY - timedelta(days=29 - i)
        is_weekend = d.weekday() >= 5

        steps = random.randint(3000, 6000) if is_weekend else random.randint(6000, 13000)
        sleep = random.randint(300, 540)
        resting_hr = random.randint(56, 74)
        active_cal = random.randint(150, 600)

        session.add(HealthMetric(
            date=d,
            steps=steps,
            sleep_minutes=sleep,
            resting_hr=resting_hr,
            active_calories=active_cal,
        ))

    logger.info("Seeded 30 days of health metrics")


async def seed_transactions(session: AsyncSession) -> None:
    """Generate ~60 transactions across 30 days."""
    for i in range(30):
        d = TODAY - timedelta(days=29 - i)

        # 1-3 expenses per day
        num_expenses = random.randint(1, 3)
        for _ in range(num_expenses):
            cat, merchants = random.choice(EXPENSE_CATEGORIES)
            merchant = random.choice(merchants)
            amount = round(random.uniform(5, 150), 2)
            session.add(Transaction(
                date=d,
                amount=amount,
                category=cat,
                merchant=merchant,
                is_expense=True,
            ))

        # Salary on 1st and 15th
        if d.day in (1, 15):
            session.add(Transaction(
                date=d,
                amount=2500.00,
                category="salary",
                merchant="Employer Inc.",
                is_expense=False,
            ))

    logger.info("Seeded ~60+ transactions")


async def seed_media(session: AsyncSession) -> None:
    """Seed movie entries from the list."""
    for title, rating, date_str in MOVIES:
        session.add(MediaLog(
            media_type="movie",
            title=title,
            rating=rating,
            consumed_at=date.fromisoformat(date_str),
        ))

    logger.info(f"Seeded {len(MOVIES)} movie entries")


async def seed_locations(session: AsyncSession) -> None:
    """Generate 100 location pings across multiple cities."""
    for i in range(100):
        city_name, base_lat, base_lng, radius = random.choice(CITIES)
        lat = base_lat + random.uniform(-radius, radius)
        lng = base_lng + random.uniform(-radius, radius)
        ts = datetime.now(timezone.utc) - timedelta(
            hours=random.randint(1, 720)  # Spread across ~30 days
        )

        session.add(LocationPing(
            timestamp=ts,
            lat=round(lat, 6),
            lng=round(lng, 6),
            accuracy=round(random.uniform(5, 50), 1),
        ))

    logger.info("Seeded 100 location pings")


async def seed_goals(session: AsyncSession) -> None:
    """Seed yearly goals."""
    for title, target, current, unit, deadline_str in GOAL_TEMPLATES:
        session.add(Goal(
            title=title,
            target=target,
            current=current,
            unit=unit,
            deadline=date.fromisoformat(deadline_str),
        ))

    logger.info(f"Seeded {len(GOAL_TEMPLATES)} goals")


async def seed_habits(session: AsyncSession) -> None:
    """Seed habits with realistic streaks."""
    for name, streak in HABIT_NAMES:
        # Some habits completed today, some yesterday
        completed_offset = random.choice([0, 0, 0, 1, 2])
        last_completed = TODAY - timedelta(days=completed_offset)

        session.add(Habit(
            name=name,
            streak=streak,
            last_completed=last_completed,
            is_active=True,
        ))

    logger.info(f"Seeded {len(HABIT_NAMES)} habits")


async def seed() -> None:
    logger.info("Starting seed...")

    async with async_session_factory() as session:
        await seed_health(session)
        await seed_transactions(session)
        await seed_media(session)
        await seed_locations(session)
        await seed_goals(session)
        await seed_habits(session)

        await session.commit()
        logger.info("All Silver data committed")

        # Refresh Gold materialized views
        await session.execute(
            text("REFRESH MATERIALIZED VIEW CONCURRENTLY gold_daily_summary")
        )
        await session.execute(
            text("REFRESH MATERIALIZED VIEW CONCURRENTLY gold_monthly_finance")
        )
        await session.commit()
        logger.info("Gold views refreshed")

    logger.info("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
