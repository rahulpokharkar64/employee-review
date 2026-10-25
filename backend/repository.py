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

# A review with the employee and period labels the register UI shows. comments is nullable in some
# database versions, but the API contract says it is always present, so NULL is returned as an empty string.
_REVIEW_WITH_LABELS = """
    SELECT r.id, r.employee_id, e.employee_id AS employee_code, e.name AS employee_name,
           r.period_id, p.name AS period_name, r.quality_rating, r.delivery_rating, r.teamwork_rating,
           r.average_rating, COALESCE(r.comments, '') AS comments, r.created_at
    FROM performance_reviews r
    JOIN employees e ON e.id = r.employee_id
    JOIN review_periods p ON p.id = r.period_id
"""

def get_employees(status=None):
    """All employees by code. Pass status (Active/Inactive) to restrict; None returns everyone."""
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            "SELECT * FROM employees WHERE (%s::text IS NULL OR status = %s) ORDER BY employee_id;",
            (status, status),
        )
        return cursor.fetchall()

def get_review_periods(status=None):
    """All periods, newest first. Pass status (Open/Closed) to restrict; None returns every period."""
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            "SELECT * FROM review_periods WHERE (%s::text IS NULL OR status = %s) ORDER BY start_date DESC, id DESC;",
            (status, status),
        )
        return cursor.fetchall()

def list_reviews(employee_id=None, period_id=None):
    """Reviews matching every filter given (AND), newest first. Filters left as None are ignored."""
    conditions, params = [], []
    if employee_id is not None:
        conditions.append("r.employee_id = %s")
        params.append(employee_id)
    if period_id is not None:
        conditions.append("r.period_id = %s")
        params.append(period_id)
    # Only fixed SQL fragments are joined here; every user value goes through %s parameters
    where_clause = " AND ".join(conditions) if conditions else "TRUE"
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute(f"{_REVIEW_WITH_LABELS} WHERE {where_clause} ORDER BY r.created_at DESC, r.id DESC;", params)
        return cursor.fetchall()

def get_review_by_id(review_id: int):
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute(f"{_REVIEW_WITH_LABELS} WHERE r.id = %s;", (review_id,))
        return cursor.fetchone()

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
    Inserts a review and returns the saved row with employee and period labels, or None when the employee
    already has a review for that period.
    The database may not have UNIQUE (employee_id, period_id), so this does not rely on one: a transaction-level
    advisory lock on the pair makes concurrent requests for the same employee and period run one after another,
    and the insert only happens when no review exists yet.
    """
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cursor:
        cursor.execute("SELECT pg_advisory_xact_lock(%s, %s);", (data["employee_id"], data["period_id"]))
        cursor.execute(
            """
            WITH inserted AS (
                INSERT INTO performance_reviews (
                    employee_id, period_id, quality_rating, delivery_rating, teamwork_rating, average_rating, comments
                )
                SELECT %s, %s, %s, %s, %s, %s, %s
                WHERE NOT EXISTS (
                    SELECT 1 FROM performance_reviews WHERE employee_id = %s AND period_id = %s
                )
                RETURNING *
            )
            SELECT i.*, e.employee_id AS employee_code, e.name AS employee_name, p.name AS period_name
            FROM inserted i
            JOIN employees e ON e.id = i.employee_id
            JOIN review_periods p ON p.id = i.period_id;
            """,
            (
                data["employee_id"], data["period_id"], data["quality_rating"], data["delivery_rating"],
                data["teamwork_rating"], average_rating, data["comments"],
                data["employee_id"], data["period_id"],
            ),
        )
        return cursor.fetchone()
