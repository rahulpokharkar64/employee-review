import os
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from errors import ApiError
from models import ErrorResponse, Review, ReviewCreate
from repository import check_database, get_employee_by_id, get_period_by_id, insert_review
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
    if get_employee_by_id(payload.employee_id) is None:
        raise ApiError(404, "EMPLOYEE_NOT_FOUND", f"Employee with id {payload.employee_id} was not found.")
    period = get_period_by_id(payload.period_id)
    if period is None:
        raise ApiError(404, "PERIOD_NOT_FOUND", f"Review period with id {payload.period_id} was not found.")
    if not period_accepts_reviews(period):
        raise ApiError(400, "REVIEW_PERIOD_CLOSED", "Only Open review periods accept new reviews.")

    data = payload.model_dump()
    saved = insert_review(data, calculate_average(data))
    if saved is None:
        raise ApiError(409, "DUPLICATE_REVIEW", "A review already exists for this employee and period.")
    return saved

app.include_router(api)
