import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
import service
from errors import ApiError
from service import calculate_average, find_employees, period_accepts_reviews, submit_review

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

def test_submit_saves_with_calculated_average(monkeypatch):
    seen = patch_lookups(monkeypatch)
    assert submit_review(DATA) == "SAVED" and seen["average"] == 4.33

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

def test_find_employees_passes_filters_to_repository(monkeypatch):
    seen = {}
    monkeypatch.setattr(service, "search_employees", lambda **kw: seen.update(kw) or ["row"])
    assert find_employees(employee_code="EMP101") == ["row"]
    assert seen == {"employee_code": "EMP101", "name": None}
