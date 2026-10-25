"""
Business rules. Routes call these functions; they call repository.py for data and raise ApiError for rule failures.
Nothing here knows about HTTP, SQL or FastAPI.
"""
from errors import ApiError
from repository import get_employee_by_id, get_period_by_id, insert_review, search_employees

RATING_FIELDS = ["quality_rating", "delivery_rating", "teamwork_rating"]

def calculate_average(review: dict) -> float:
    """Average rating = (quality + delivery + teamwork) / 3, rounded to 2 decimals."""
    return round(sum(review[field] for field in RATING_FIELDS) / len(RATING_FIELDS), 2)

def period_accepts_reviews(period: dict) -> bool:
    """Only open periods accept new reviews."""
    return period["status"] == "Open"

def submit_review(data: dict) -> dict:
    """
    Validates a review submission and saves it. The rules, in order:
    the employee exists (404), the period exists (404), the period is Open (400), and the employee has no
    review for the period yet (409). The average is calculated here, never taken from the client.
    """
    if get_employee_by_id(data["employee_id"]) is None:
        raise ApiError(404, "EMPLOYEE_NOT_FOUND", f"Employee with id {data['employee_id']} was not found.")
    period = get_period_by_id(data["period_id"])
    if period is None:
        raise ApiError(404, "PERIOD_NOT_FOUND", f"Review period with id {data['period_id']} was not found.")
    if not period_accepts_reviews(period):
        raise ApiError(400, "REVIEW_PERIOD_CLOSED", "Only Open review periods accept new reviews.")

    # insert_review returns None when a review for the pair already exists. The check is atomic in the
    # repository, so two simultaneous submissions cannot both succeed.
    saved = insert_review(data, calculate_average(data))
    if saved is None:
        raise ApiError(409, "DUPLICATE_REVIEW", "A review already exists for this employee and period.")
    return saved

def find_employees(employee_code=None, name=None) -> list:
    """Employees by code, name, or both. At least one filter is required."""
    if employee_code is None and name is None:
        raise ApiError(422, "FILTER_REQUIRED", "Provide at least one filter: employee_id or name.")
    return search_employees(employee_code=employee_code, name=name)
