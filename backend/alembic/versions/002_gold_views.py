"""gold materialized views

Revision ID: 002
Revises: 001
Create Date: 2026-03-06
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Gold: daily dashboard summary
    op.execute("""
        CREATE MATERIALIZED VIEW gold_daily_summary AS
        SELECT
            d.day,
            COALESCE(h.total_steps, 0)     AS total_steps,
            COALESCE(h.sleep_minutes, 0)    AS sleep_minutes,
            COALESCE(h.resting_hr, 0)       AS resting_hr,
            COALESCE(f.total_spent, 0)      AS total_spent,
            COALESCE(f.total_income, 0)     AS total_income,
            COALESCE(hab.habits_completed, 0) AS habits_completed
        FROM (
            SELECT generate_series(
                CURRENT_DATE - INTERVAL '365 days',
                CURRENT_DATE,
                '1 day'::interval
            )::date AS day
        ) d
        LEFT JOIN (
            SELECT date AS day, steps AS total_steps, sleep_minutes, resting_hr
            FROM health_metrics
        ) h ON d.day = h.day
        LEFT JOIN (
            SELECT
                date AS day,
                SUM(CASE WHEN is_expense THEN amount ELSE 0 END) AS total_spent,
                SUM(CASE WHEN NOT is_expense THEN amount ELSE 0 END) AS total_income
            FROM transactions
            GROUP BY date
        ) f ON d.day = f.day
        LEFT JOIN (
            SELECT last_completed AS day, COUNT(*) AS habits_completed
            FROM habits
            WHERE is_active = true
            GROUP BY last_completed
        ) hab ON d.day = hab.day
        WITH DATA;
    """)

    # Unique index required for REFRESH CONCURRENTLY
    op.execute("""
        CREATE UNIQUE INDEX uix_gold_daily_summary_day ON gold_daily_summary (day);
    """)

    # Gold: monthly finance summary
    op.execute("""
        CREATE MATERIALIZED VIEW gold_monthly_finance AS
        SELECT
            to_char(date, 'YYYY-MM') AS month,
            SUM(CASE WHEN NOT is_expense THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN is_expense THEN amount ELSE 0 END) AS expenses
        FROM transactions
        GROUP BY to_char(date, 'YYYY-MM')
        ORDER BY month
        WITH DATA;
    """)

    op.execute("""
        CREATE UNIQUE INDEX uix_gold_monthly_finance_month ON gold_monthly_finance (month);
    """)


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS gold_monthly_finance CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS gold_daily_summary CASCADE;")
