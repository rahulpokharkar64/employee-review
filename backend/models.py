from datetime import datetime
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Rating = Annotated[int, Field(ge=1, le=5)]

class ReviewCreate(BaseModel):
    """Fields a client sends to create a review. id, average_rating, status and created_at are set by the server.
    Unknown fields are rejected (422), as the contract's additionalProperties: false requires."""
    model_config = ConfigDict(extra="forbid")

    employee_id: int = Field(ge=1)
    period_id: int = Field(ge=1)
    quality_rating: Rating
    delivery_rating: Rating
    teamwork_rating: Rating
    comments: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]

class Review(BaseModel):
    """A stored review with the employee and period labels the register UI shows."""
    id: int
    employee_id: int
    employee_code: str
    employee_name: str
    period_id: int
    period_name: str
    quality_rating: int
    delivery_rating: int
    teamwork_rating: int
    average_rating: float
    comments: str
    # Derived label for a saved review; there is no status column in the database
    status: Literal["Completed"] = "Completed"
    created_at: datetime

class ErrorResponse(BaseModel):
    code: str
    message: str
