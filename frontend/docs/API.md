# API usage

Base URL: `VITE_API_BASE_URL` (default `http://localhost:8000/api`). Interactive docs: http://localhost:8000/docs. All calls live in `src/api.ts`.

| Function | Request | Used by |
| --- | --- | --- |
| `getEmployees(status?)` | `GET /employees[?status=Active\|Inactive]` | Form, filters, My Reviews, Employees, Dashboard |
| `getReviewPeriods(status?)` | `GET /review-periods[?status=Open\|Closed]` | Form (Open only), filters, Dashboard |
| `getReviews({employee_code, period_id})` | `GET /reviews[?employee_id=EMP101&period_id=3]` | Reviews, My Reviews, Dashboard, Employees |
| `getReview(id)` | `GET /reviews/{id}` | Review Details |
| `createReview(payload)` | `POST /reviews` | Submit Review |

Note: the review list filter `employee_id` takes the **employee code** (`EMP101`), while `POST /reviews` takes the **numeric employee id** (`Employee.id`). In the UI `Employee.employee_id` is the code and `Employee.id` the numeric key.

## POST /reviews body
```json
{ "employee_id": 1, "period_id": 3, "quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4, "comments": "Strong ownership." }
```
The server calculates `average_rating`; unknown fields are rejected.

## Errors shown to the user
| Status | Code | Message source |
| --- | --- | --- |
| 400 | `REVIEW_PERIOD_CLOSED` | backend `message` |
| 404 | `EMPLOYEE_NOT_FOUND`, `PERIOD_NOT_FOUND`, `REVIEW_NOT_FOUND` | backend `message` |
| 409 | `DUPLICATE_REVIEW` | backend `message` |
| 422 | FastAPI `detail[]` | joined into one line |
| network failure | – | "Cannot reach the API at … Is the backend running?" |

## Troubleshooting
- **"Cannot reach the API"**: start the backend (`uvicorn main:app --reload`) and check `VITE_API_BASE_URL`.
- **CORS error in the console**: open the app at `http://localhost:5173` or add your origin to `CORS_ORIGINS` in `backend/.env`.
- **Empty lists**: load the sample data with `database/CreateQueries.sql`.
