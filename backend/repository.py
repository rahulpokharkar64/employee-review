from psycopg.rows import dict_row
from database import get_connection

def check_database(timeout: float = 3) -> bool:
    """True when a connection can be opened and a trivial query runs; False on any database error or after `timeout` seconds."""
    try:
        with get_connection(timeout=timeout) as conn, conn.cursor() as cursor:
            cursor.execute("SELECT 1;")
            return cursor.fetchone() == (1,)
    except Exception:
        return False

def get_employee_by_id(employee_id: int):
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute("SELECT * FROM employees WHERE id = %s;", (employee_id,))
        return cursor.fetchone()

def get_period_by_id(period_id: int):
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute("SELECT * FROM review_periods WHERE id = %s;", (period_id,))
        return cursor.fetchone()

def insert_review(data: dict, average_rating: float):
    """
    Inserts a review and returns the saved row, or None when the employee already has a review for that period.
    The spec's table has no UNIQUE (employee_id, period_id), so this does not rely on one: a transaction-level
    advisory lock on the pair makes concurrent requests for the same employee and period run one after another,
    and the insert only happens when no review exists yet.
    """
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute("SELECT pg_advisory_xact_lock(%s, %s);", (data["employee_id"], data["period_id"]))
        cursor.execute(
            """
            INSERT INTO performance_reviews (
                employee_id, period_id, quality_rating, delivery_rating, teamwork_rating, average_rating, comments
            )
            SELECT %s, %s, %s, %s, %s, %s, %s
            WHERE NOT EXISTS (
                SELECT 1 FROM performance_reviews WHERE employee_id = %s AND period_id = %s
            )
            RETURNING *;
            """,
            (
                data["employee_id"], data["period_id"], data["quality_rating"], data["delivery_rating"],
                data["teamwork_rating"], average_rating, data["comments"],
                data["employee_id"], data["period_id"],
            ),
        )
        return cursor.fetchone()
