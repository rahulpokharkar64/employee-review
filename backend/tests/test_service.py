import sys
from datetime import date, datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
import service
from errors import ApiError
from models import Employee, Review, ReviewPeriod
from service import (
    calculate_average, database_is_up, find_employees, get_review, get_reviews,
    list_employees, list_review_periods, period_accepts_reviews, submit_review,
)

def test_average_matches_spec_example():
    assert calculate_average({"quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4}) == 4.33

def test_average_bounds():
    assert calculate_average({"quality_rating": 1, "delivery_rating": 1, "teamwork_rating": 1}) == 1.0
    assert calculate_average({"quality_rating": 5, "delivery_rating": 5, "teamwork_rating": 5}) == 5.0
    assert calculate_average({"quality_rating": 2, "delivery_rating": 3, "teamwork_rating": 3}) == 2.67

def test_only_open_periods_accept_reviews():
    assert period_accepts_reviews({"status": "Open"})
    assert not period_accepts_reviews({"status": "Closed"})

DATA = {"employee_id": 1, "period_id": 2, "quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4, "comments": "ok"}
OPEN = {"id": 2, "name": "H1 2026", "status": "Open"}

def patch_lookups(monkeypatch, employee=True, period=OPEN, saved="SAVED"):
    seen = {}
    monkeypatch.setattr(service, "get_employee_by_id", lambda i: {"id": i} if employee else None)
    monkeypatch.setattr(service, "get_period_by_id", lambda i: period)
    def insert(data, average):
        seen["average"] = average
        return saved
    monkeypatch.setattr(service, "insert_review", insert)
    return seen

SAVED_REVIEW = {
    "id": 1, "employee_id": 1, "employee_code": "EMP101", "employee_name": "John Smith",
    "period_id": 2, "period_name": "H1 2026", "quality_rating": 4, "delivery_rating": 5,
    "teamwork_rating": 4, "average_rating": 4.33, "comments": "ok",
    "created_at": datetime(2026, 1, 15, 10, 30),
}

def test_submit_saves_with_calculated_average(monkeypatch):
    seen = patch_lookups(monkeypatch, saved=SAVED_REVIEW)
    saved = submit_review(DATA)
    assert isinstance(saved, Review)
    assert saved.average_rating == 4.33 and saved.status == "Completed"
    assert seen["average"] == 4.33

def test_submit_unknown_employee_is_404(monkeypatch):
    patch_lookups(monkeypatch, employee=False)
    with pytest.raises(ApiError) as error:
        submit_review(DATA)
    assert (error.value.status_code, error.value.code) == (404, "EMPLOYEE_NOT_FOUND")

def test_submit_unknown_period_is_404(monkeypatch):
    patch_lookups(monkeypatch, period=None)
    with pytest.raises(ApiError) as error:
        submit_review(DATA)
    assert (error.value.status_code, error.value.code) == (404, "PERIOD_NOT_FOUND")

def test_submit_closed_period_is_400(monkeypatch):
    patch_lookups(monkeypatch, period={**OPEN, "status": "Closed"})
    with pytest.raises(ApiError) as error:
        submit_review(DATA)
    assert (error.value.status_code, error.value.code) == (400, "REVIEW_PERIOD_CLOSED")

def test_submit_duplicate_is_409(monkeypatch):
    patch_lookups(monkeypatch, saved=None)
    with pytest.raises(ApiError) as error:
        submit_review(DATA)
    assert (error.value.status_code, error.value.code) == (409, "DUPLICATE_REVIEW")

def test_find_employees_requires_a_filter():
    with pytest.raises(ApiError) as error:
        find_employees()
    assert error.value.status_code == 422

EMPLOYEE = {
    "id": 1, "employee_id": "EMP101", "name": "John Smith",
    "department": "Engineering", "email": None, "status": "Active",
}
PERIOD = {
    "id": 2, "name": "H1 2026", "start_date": date(2026, 1, 1),
    "end_date": date(2026, 6, 30), "status": "Open",
}

def test_find_employees_passes_filters_to_repository(monkeypatch):
    seen = {}
    monkeypatch.setattr(service, "search_employees", lambda **kw: seen.update(kw) or [EMPLOYEE])
    assert find_employees(employee_code="EMP101") == [Employee.model_validate(EMPLOYEE)]
    assert seen == {"employee_code": "EMP101", "name": None}

def test_get_review_returns_the_row(monkeypatch):
    monkeypatch.setattr(service, "get_review_by_id", lambda review_id: SAVED_REVIEW if review_id == 7 else None)
    assert get_review(7) == Review.model_validate(SAVED_REVIEW)

def test_get_review_missing_raises_review_not_found(monkeypatch):
    monkeypatch.setattr(service, "get_review_by_id", lambda review_id: None)
    with pytest.raises(ApiError) as error:
        get_review(9)
    assert (error.value.status_code, error.value.code, error.value.message) == (
        404, "REVIEW_NOT_FOUND", "No review exists with id 9.",
    )

def test_list_employees_passes_status_through(monkeypatch):
    seen = []
    monkeypatch.setattr(service, "get_employees", lambda status: seen.append(status) or [EMPLOYEE])
    assert list_employees(status="Active") == [Employee.model_validate(EMPLOYEE)]
    monkeypatch.setattr(service, "get_employees", lambda status: seen.append(status) or [])
    assert list_employees() == []
    assert seen == ["Active", None]

def test_list_review_periods_passes_status_through(monkeypatch):
    seen = []
    monkeypatch.setattr(service, "get_review_periods", lambda status: seen.append(status) or [PERIOD])
    assert list_review_periods(status="Open") == [ReviewPeriod.model_validate(PERIOD)]
    monkeypatch.setattr(service, "get_review_periods", lambda status: seen.append(status) or [])
    assert list_review_periods() == []
    assert seen == ["Open", None]

def test_get_reviews_passes_filters_through(monkeypatch):
    seen = []
    monkeypatch.setattr(service, "list_reviews", lambda **kw: seen.append(kw) or [SAVED_REVIEW])
    assert get_reviews(employee_code="EMP101", period_id=3) == [Review.model_validate(SAVED_REVIEW)]
    monkeypatch.setattr(service, "list_reviews", lambda **kw: seen.append(kw) or [])
    assert get_reviews() == []
    assert seen == [
        {"employee_code": "EMP101", "period_id": 3},
        {"employee_code": None, "period_id": None},
    ]

def test_database_is_up_returns_check_database(monkeypatch):
    monkeypatch.setattr(service, "check_database", lambda: True)
    assert database_is_up() is True
    monkeypatch.setattr(service, "check_database", lambda: False)
    assert database_is_up() is False
