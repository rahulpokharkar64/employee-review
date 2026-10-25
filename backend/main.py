import os
from typing import List, Literal, Optional
from fastapi import APIRouter, FastAPI, Path, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from errors import ApiError
from models import Employee, ErrorResponse, Review, ReviewCreate, ReviewPeriod
from repository import check_database
import service

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

@app.exception_handler(ApiError)
async def api_error_handler(request: Request, error: ApiError):
    return JSONResponse(status_code=error.status_code, content={"code": error.code, "message": error.message})

@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, error: Exception):
    return JSONResponse(status_code=500, content={"code": "SERVER_ERROR", "message": "An unexpected error occurred."})

api = APIRouter(prefix="/api")

@api.get("/health")
def health(response: Response):
    """Connectivity check. 200 when the API and the database are reachable, 503 when the database is not."""
    if check_database():
        return {"status": "ok", "database": "up"}
    response.status_code = 503
    return {"status": "unavailable", "database": "down"}

@api.get("/employees", response_model=List[Employee])
def list_employees(status: Optional[Literal["Active", "Inactive"]] = None):
    """Employee master records for the review form. Pass status=Active to return only active employees."""
    return service.list_employees(status)

@api.get(
    "/employees/search",
    response_model=List[Employee],
    responses={422: {"description": "No filter given"}},
)
def search_employees_endpoint(
    employee_id: Optional[str] = Query(default=None, min_length=1, max_length=20, description="Employee code, e.g. EMP101 (case-insensitive, exact)"),
    name: Optional[str] = Query(default=None, min_length=1, max_length=100, description="Part of the employee name (case-insensitive)"),
):
    """
    Finds employees by code, by name, or both (AND). At least one of employee_id or name is required (422 otherwise).
    Returns [] when nothing matches.
    """
    return service.find_employees(employee_code=employee_id, name=name)

@api.get("/review-periods", response_model=List[ReviewPeriod])
def list_review_periods(status: Optional[Literal["Open", "Closed"]] = None):
    """Configured review periods, newest first. The form should submit only to a period with status Open."""
    return service.list_review_periods(status)

@api.get("/reviews", response_model=List[Review])
def reviews(
    employee_id: Optional[str] = Query(default=None, min_length=1, max_length=20, description="Employee code, e.g. EMP101 (case-insensitive)"),
    period_id: Optional[int] = Query(default=None, ge=1, description="review_periods.id (numeric DB key)"),
):
    """Reviews for the register, newest first, optionally filtered by employee code and/or period (AND). An empty result is []."""
    return service.list_reviews(employee_code=employee_id, period_id=period_id)

@api.get("/reviews/{id}", response_model=Review, responses={404: {"model": ErrorResponse}})
def get_review(id: int = Path(ge=1, description="performance_reviews.id")):
    """One review. 404 REVIEW_NOT_FOUND if it does not exist."""
    return service.get_review(id)

@api.post(
    "/reviews",
    status_code=201,
    response_model=Review,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
def create_review(payload: ReviewCreate):
    """
    Submits a review. The server calculates average_rating.
    404 EMPLOYEE_NOT_FOUND / PERIOD_NOT_FOUND; 400 REVIEW_PERIOD_CLOSED; 409 DUPLICATE_REVIEW; 422 invalid body.
    """
    return service.submit_review(payload.model_dump())

app.include_router(api)
