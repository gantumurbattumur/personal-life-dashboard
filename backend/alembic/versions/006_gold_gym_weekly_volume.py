"""add gold gym weekly volume view

Revision ID: 006
Revises: 005
Create Date: 2026-03-06
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE MATERIALIZED VIEW gold_gym_weekly_volume AS
        SELECT
            date_trunc('week', date)::date AS week_start,
            SUM(workouts_count) AS workouts_count,
            SUM(total_duration_min) AS total_duration_min,
            SUM(total_calories_burned) AS total_calories_burned,
            SUM(training_load) AS training_load
        FROM workout_daily_summary
        GROUP BY date_trunc('week', date)::date
        ORDER BY week_start
        WITH DATA;
        """
    )

    op.execute(
        """
        CREATE UNIQUE INDEX uix_gold_gym_weekly_volume_week_start
        ON gold_gym_weekly_volume (week_start);
        """
    )


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS gold_gym_weekly_volume CASCADE;")
