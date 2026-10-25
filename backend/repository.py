from psycopg.rows import dict_row
from database import get_connection

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
    The duplicate check and the insert are one statement (UNIQUE(employee_id, period_id)), so two requests cannot both insert.
    """
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            """
            INSERT INTO performance_reviews (
                employee_id, period_id, quality_rating, delivery_rating, teamwork_rating, average_rating, comments
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (employee_id, period_id) DO NOTHING
            RETURNING *;
            """,
            (
                data["employee_id"], data["period_id"], data["quality_rating"], data["delivery_rating"],
                data["teamwork_rating"], average_rating, data["comments"],
            ),
        )
        return cursor.fetchone()
