import sys
from datetime import date, datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
import main

# The repository is replaced with in-memory fakes, so these tests need no database.
EMPLOYEE = {"id": 1, "employee_id": "EMP101", "name": "John Smith", "department": "Engineering", "email": None, "status": "Active"}
OPEN = {"id": 2, "name": "H1 2026", "start_date": date(2026, 1, 1), "end_date": date(2026, 6, 30), "status": "Open"}
CLOSED = {**OPEN, "id": 1, "name": "H2 2025", "status": "Closed"}
BODY = {"employee_id": 1, "period_id": 2, "quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4, "comments": "Strong performer."}

@pytest.fixture
def client(monkeypatch):
    saved = {}
    monkeypatch.setattr(main, "get_employee_by_id", lambda i: EMPLOYEE if i == 1 else None)
    monkeypatch.setattr(main, "get_period_by_id", lambda i: {2: OPEN, 1: CLOSED}.get(i))

    def insert(data, average):
        key = (data["employee_id"], data["period_id"])
        if key in saved:
            return None
        saved[key] = {
            "id": len(saved) + 1, **data, "average_rating": average, "created_at": datetime(2026, 1, 15, 10, 30),
            "employee_code": "EMP101", "employee_name": "John Smith", "period_name": "H1 2026",
        }
        return saved[key]

    monkeypatch.setattr(main, "insert_review", insert)
    return TestClient(main.app)

def test_create_returns_enriched_review(client):
    response = client.post("/api/reviews", json=BODY)
    body = response.json()
    assert response.status_code == 201
    assert body["average_rating"] == 4.33
    assert (body["employee_code"], body["employee_name"], body["period_name"], body["status"]) == ("EMP101", "John Smith", "H1 2026", "Completed")

def test_duplicate_is_409_with_code(client):
    client.post("/api/reviews", json=BODY)
    response = client.post("/api/reviews", json=BODY)
    assert response.status_code == 409 and response.json()["code"] == "DUPLICATE_REVIEW"

def test_closed_period_is_400_with_code(client):
    response = client.post("/api/reviews", json={**BODY, "period_id": 1})
    assert response.status_code == 400
    assert response.json() == {"code": "REVIEW_PERIOD_CLOSED", "message": "Only Open review periods accept new reviews."}

def test_unknown_employee_or_period_is_404_with_code(client):
    assert client.post("/api/reviews", json={**BODY, "employee_id": 99}).json()["code"] == "EMPLOYEE_NOT_FOUND"
    response = client.post("/api/reviews", json={**BODY, "period_id": 99})
    assert response.status_code == 404 and response.json()["code"] == "PERIOD_NOT_FOUND"

def test_unknown_fields_are_rejected(client):
    assert client.post("/api/reviews", json={**BODY, "average_rating": 5}).status_code == 422

@pytest.mark.parametrize("change", [
    {"quality_rating": 0}, {"delivery_rating": 6}, {"teamwork_rating": "x"}, {"comments": "   "}, {"comments": ""},
])
def test_invalid_input_is_422(client, change):
    assert client.post("/api/reviews", json={**BODY, **change}).status_code == 422

def test_health_ok(client, monkeypatch):
    monkeypatch.setattr(main, "check_database", lambda: True)
    response = client.get("/api/health")
    assert response.status_code == 200 and response.json() == {"status": "ok", "database": "up"}

def test_health_database_down_is_503(client, monkeypatch):
    monkeypatch.setattr(main, "check_database", lambda: False)
    response = client.get("/api/health")
    assert response.status_code == 503 and response.json()["database"] == "down"

REVIEW_ROW = {
    "id": 101, "employee_id": 1, "employee_code": "EMP101", "employee_name": "John Smith", "period_id": 3, "period_name": "H2 2026",
    "quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4, "average_rating": 4.33, "comments": "Strong.",
    "created_at": datetime(2026, 10, 25, 9, 30),
}

def test_list_employees_passes_status_filter(client, monkeypatch):
    seen = []
    monkeypatch.setattr(main, "get_employees", lambda status: seen.append(status) or [EMPLOYEE])
    assert client.get("/api/employees").status_code == 200
    response = client.get("/api/employees?status=Active")
    assert response.json()[0]["employee_id"] == "EMP101" and seen == [None, "Active"]
    assert client.get("/api/employees?status=Gone").status_code == 422

def test_list_review_periods_filter(client, monkeypatch):
    monkeypatch.setattr(main, "get_review_periods", lambda status: [OPEN] if status == "Open" else [OPEN, CLOSED])
    assert len(client.get("/api/review-periods").json()) == 2
    assert client.get("/api/review-periods?status=Open").json()[0]["status"] == "Open"
    assert client.get("/api/review-periods?status=Nope").status_code == 422

def test_list_reviews_filters_and_status_label(client, monkeypatch):
    seen = {}
    monkeypatch.setattr(main, "list_reviews", lambda **kw: seen.update(kw) or [REVIEW_ROW])
    response = client.get("/api/reviews?employee_id=1&period_id=3")
    assert seen == {"employee_id": 1, "period_id": 3}
    assert response.json()[0]["status"] == "Completed"

def test_list_reviews_empty_is_empty_array(client, monkeypatch):
    monkeypatch.setattr(main, "list_reviews", lambda **kw: [])
    assert client.get("/api/reviews").json() == []

@pytest.mark.parametrize("query", ["employee_id=abc", "period_id=0", "employee_id=-1"])
def test_list_reviews_invalid_filter_is_422(client, query):
    assert client.get(f"/api/reviews?{query}").status_code == 422

def test_get_review_by_id(client, monkeypatch):
    monkeypatch.setattr(main, "get_review_by_id", lambda i: REVIEW_ROW if i == 101 else None)
    assert client.get("/api/reviews/101").json()["employee_name"] == "John Smith"
    missing = client.get("/api/reviews/999")
    assert missing.status_code == 404 and missing.json()["code"] == "REVIEW_NOT_FOUND"
    assert client.get("/api/reviews/abc").status_code == 422
