"""Dashboard read-only endpoints — queries Gold and Silver layers."""

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gold import GoldDailySummary, GoldMonthlyFinance
from app.models.silver import (
    Goal,
    Habit,
    HealthMetric,
    LocationPing,
    MediaLog,
    Transaction,
)
from app.schemas.gold import (
    DailySummaryOut,
    HabitCalendarDay,
    MapPointOut,
    MonthlyFinanceOut,
    TodayDashboardOut,
)
from app.schemas.silver import (
    GoalOut,
    HabitOut,
    HealthMetricOut,
    MediaLogOut,
    TransactionOut,
)

router = APIRouter()


@router.get("/today", response_model=TodayDashboardOut)
async def get_today_summary(db: AsyncSession = Depends(get_db)):
    """Today's combined stats: steps, sleep, spending, habits."""
    today = date.today()

    # Try Gold view first
    result = await db.execute(
        select(GoldDailySummary).where(GoldDailySummary.day == today)
    )
    summary = result.scalar_one_or_none()

    # Count total active habits
    habits_total_result = await db.execute(
        select(func.count()).select_from(Habit).where(Habit.is_active == True)  # noqa: E712
    )
    habits_total = habits_total_result.scalar() or 0

    if summary:
        return TodayDashboardOut(
            date=today,
            steps=summary.total_steps,
            sleep_minutes=summary.sleep_minutes,
            resting_hr=summary.resting_hr,
            total_spent=float(summary.total_spent),
            total_income=float(summary.total_income),
            habits_done=summary.habits_completed,
            habits_total=habits_total,
        )

    # Fallback: query Silver directly
    health = await db.execute(
        select(HealthMetric).where(HealthMetric.date == today)
    )
    h = health.scalar_one_or_none()

    finance = await db.execute(
        select(
            func.coalesce(func.sum(
                func.case((Transaction.is_expense == True, Transaction.amount), else_=0)  # noqa: E712
            ), 0).label("spent"),
            func.coalesce(func.sum(
                func.case((Transaction.is_expense == False, Transaction.amount), else_=0)  # noqa: E712
            ), 0).label("income"),
        ).where(Transaction.date == today)
    )
    fin = finance.one()

    habits_done_result = await db.execute(
        select(func.count())
        .select_from(Habit)
        .where(Habit.is_active == True, Habit.last_completed == today)  # noqa: E712
    )
    habits_done = habits_done_result.scalar() or 0

    return TodayDashboardOut(
        date=today,
        steps=h.steps if h else 0,
        sleep_minutes=h.sleep_minutes if h else 0,
        resting_hr=h.resting_hr if h else 0,
        total_spent=float(fin.spent),
        total_income=float(fin.income),
        habits_done=habits_done,
        habits_total=habits_total,
    )


@router.get("/map", response_model=list[MapPointOut])
async def get_map_points(db: AsyncSession = Depends(get_db)):
    """Last 100 location coordinates for the world map."""
    result = await db.execute(
        select(LocationPing)
        .order_by(LocationPing.timestamp.desc())
        .limit(100)
    )
    pings = result.scalars().all()
    return [
        MapPointOut(
            lat=p.lat,
            lng=p.lng,
            timestamp=p.timestamp.isoformat(),
        )
        for p in pings
    ]


@router.get("/charts/finance", response_model=list[MonthlyFinanceOut])
async def get_finance_charts(db: AsyncSession = Depends(get_db)):
    """Aggregated monthly income vs expenses (last 12 months)."""
    result = await db.execute(
        select(GoldMonthlyFinance)
        .order_by(GoldMonthlyFinance.month.desc())
        .limit(12)
    )
    rows = result.scalars().all()
    return [
        MonthlyFinanceOut(
            month=r.month,
            income=float(r.income),
            expenses=float(r.expenses),
        )
        for r in reversed(rows)  # Chronological order
    ]


@router.get("/charts/health", response_model=list[HealthMetricOut])
async def get_health_trends(db: AsyncSession = Depends(get_db)):
    """30-day health metrics trend."""
    cutoff = date.today() - timedelta(days=30)
    result = await db.execute(
        select(HealthMetric)
        .where(HealthMetric.date >= cutoff)
        .order_by(HealthMetric.date)
    )
    return result.scalars().all()


@router.get("/goals", response_model=list[GoalOut])
async def get_goals(db: AsyncSession = Depends(get_db)):
    """All goals with progress percentages."""
    result = await db.execute(select(Goal).order_by(Goal.deadline))
    goals = result.scalars().all()
    return [GoalOut.from_goal(g) for g in goals]


@router.get("/habits", response_model=list[HabitOut])
async def get_habits(db: AsyncSession = Depends(get_db)):
    """Active habits with streaks."""
    result = await db.execute(
        select(Habit).where(Habit.is_active == True).order_by(Habit.name)  # noqa: E712
    )
    return result.scalars().all()


@router.get("/media/recent", response_model=list[MediaLogOut])
async def get_recent_media(db: AsyncSession = Depends(get_db)):
    """Recently consumed media (last 20)."""
    result = await db.execute(
        select(MediaLog)
        .order_by(MediaLog.consumed_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.get("/calendar", response_model=list[HabitCalendarDay])
async def get_habit_calendar(db: AsyncSession = Depends(get_db)):
    """Daily habit completion counts for the life calendar heatmap."""
    result = await db.execute(
        select(
            GoldDailySummary.day,
            GoldDailySummary.habits_completed,
        )
        .where(GoldDailySummary.day >= date.today() - timedelta(days=365))
        .order_by(GoldDailySummary.day)
    )
    return [
        HabitCalendarDay(date=row.day, habits_completed=row.habits_completed)
        for row in result.all()
    ]


@router.get("/transactions/recent", response_model=list[TransactionOut])
async def get_recent_transactions(db: AsyncSession = Depends(get_db)):
    """Recent transactions (last 30)."""
    result = await db.execute(
        select(Transaction)
        .order_by(Transaction.date.desc())
        .limit(30)
    )
    return result.scalars().all()
