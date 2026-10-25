import os
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Review, ReviewCreate
from repository import get_employee_by_id, get_period_by_id, insert_review
from service import calculate_average, period_accepts_reviews

app = FastAPI(
    title="Employee Performance Review Management",
    description="Backend API",
    version="1.0.0",
)

# Allowed frontend origins come from the environment; never "*" outside local experiments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

api = APIRouter(prefix="/api")

@api.post("/reviews", status_code=201, response_model=Review)
def create_review(payload: ReviewCreate):
    """
    Submits a review. The server calculates average_rating.
    404 if the employee or period does not exist; 409 if the period is closed or the employee already has a review for it.
    """
    if get_employee_by_id(payload.employee_id) is None:
        raise HTTPException(status_code=404, detail=f"Employee ID '{payload.employee_id}' not found.")
    period = get_period_by_id(payload.period_id)
    if period is None:
        raise HTTPException(status_code=404, detail=f"Review period ID '{payload.period_id}' not found.")
    if not period_accepts_reviews(period):
        raise HTTPException(status_code=409, detail=f"Review period '{period['name']}' is closed and cannot accept new reviews.")

    data = payload.model_dump()
    saved = insert_review(data, calculate_average(data))
    if saved is None:
        raise HTTPException(status_code=409, detail="This employee already has a review for this period.")
    return saved

app.include_router(api)
