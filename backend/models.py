from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, Field, StringConstraints

Rating = Annotated[int, Field(ge=1, le=5)]

class ReviewCreate(BaseModel):
    """Fields a client sends to create a review. id, average_rating and created_at are set by the server."""
    employee_id: int = Field(ge=1)
    period_id: int = Field(ge=1)
    quality_rating: Rating
    delivery_rating: Rating
    teamwork_rating: Rating
    comments: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]

class Review(BaseModel):
    id: int
    employee_id: int
    period_id: int
    quality_rating: int
    delivery_rating: int
    teamwork_rating: int
    average_rating: float
    comments: str
    created_at: datetime
