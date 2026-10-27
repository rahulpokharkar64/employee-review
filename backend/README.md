# Backend: Employee Performance Review API

FastAPI + PostgreSQL (psycopg 3). Base path `/api`. The tables (`employees`, `review_periods`, `performance_reviews`) follow the requirements spec and live in `../database`.

## Layering
`database.py` (pool) / `repository.py` (SQL) / `service.py` (rules) / `models.py` (Pydantic) / `main.py` (routes).

## Implemented
### `GET /api/health`
Connectivity check: runs `SELECT 1`. `200 {"status":"ok","database":"up"}`, or `503 {"status":"unavailable","database":"down"}` when the database cannot be reached.

### Read endpoints (team contract)
| Endpoint | Notes |
| :-- | :-- |
| `GET /api/employees` | optional `?status=Active\|Inactive` |
| `GET /api/employees/search` | `employee_id` (code, e.g. `EMP101`, exact, case-insensitive) and/or `name` (part of the name, case-insensitive); both combine with AND; 422 when neither is given; `[]` when nothing matches. Not in the OpenAPI contract yet. |
| `GET /api/review-periods` | optional `?status=Open\|Closed`, newest first |
| `GET /api/reviews` | optional `employee_id` (employee code, e.g. `EMP101`, case-insensitive) and `period_id` (numeric DB key), combined with AND; newest first; `[]` when nothing matches; no pagination in the contract. Differs from the contract, which takes the numeric key. |
| `GET /api/reviews/{id}` | 404 `REVIEW_NOT_FOUND`; 422 for a non-integer id |

Review rows include `employee_code`, `employee_name`, `period_name` and `status: "Completed"` (derived). A NULL `comments` in the database is returned as `""`.

### `POST /api/reviews`
Follows the team's OpenAPI contract. Body (unknown fields rejected): `employee_id`, `period_id` (database ids), `quality_rating`, `delivery_rating`, `teamwork_rating` (1-5), `comments` (required, non-blank).
The server sets `id`, `average_rating = (q + d + t) / 3` (2 decimals), `created_at`, and returns the review with `employee_code`, `employee_name`, `period_name` and `status: "Completed"`.

| Status | Body | When |
| :-- | :-- | :-- |
| 201 | review | Saved |
| 400 | `{"code":"REVIEW_PERIOD_CLOSED","message":...}` | Period is Closed |
| 404 | `EMPLOYEE_NOT_FOUND` / `PERIOD_NOT_FOUND` | Unknown employee or period |
| 409 | `DUPLICATE_REVIEW` | Employee already has a review for the period |
| 422 | FastAPI `{"detail":[...]}` | Rating outside 1-5, blank comments, unknown or wrongly typed fields |
| 500 | `SERVER_ERROR` | Unexpected error |

## Duplicate protection
The one-review-per-period rule is enforced atomically in the insert (transaction-level advisory lock + `WHERE NOT EXISTS`) and by the database constraint `uq_performance_reviews_employee_period`.

Fresh databases receive the constraint from `../database/CreateQueries.sql`. Apply the guarded migration `../database/migrations/001_unique_employee_review_period.sql` to existing databases after backing them up. The migration stops if duplicate pairs already exist.

## Run
```bash
cp .env.example .env   # set DATABASE_URL
pip install -r requirements.txt
uvicorn main:app --reload   # docs at http://localhost:8000/docs
pytest                      # no database needed
```
