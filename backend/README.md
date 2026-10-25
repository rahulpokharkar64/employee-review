# Backend: Employee Performance Review API

FastAPI + PostgreSQL (psycopg 3). Base path `/api`. The tables (`employees`, `review_periods`, `performance_reviews`) follow the requirements spec and live in `../database`.

## Layering
`database.py` (pool) / `repository.py` (SQL) / `service.py` (rules) / `models.py` (Pydantic) / `main.py` (routes).

## Implemented
### `GET /api/health`
Connectivity check: runs `SELECT 1`. `200 {"status":"ok","database":"up"}`, or `503 {"status":"unavailable","database":"down"}` when the database cannot be reached.

### `POST /api/reviews`
Body: `employee_id`, `period_id` (database ids), `quality_rating`, `delivery_rating`, `teamwork_rating` (1-5), `comments` (required).
The server sets `id`, `average_rating = (q + d + t) / 3` (2 decimals) and `created_at`.

| Status | When |
| :-- | :-- |
| 201 | Saved; returns the review |
| 404 | Unknown employee or period |
| 409 | Period is Closed, or the employee already has a review for the period |
| 422 | Rating outside 1-5, missing or blank comments, wrong types |

## Notes
The one-review-per-period rule is enforced in the insert (advisory lock + `WHERE NOT EXISTS`), because the spec's table has no unique constraint.
Adding `UNIQUE (employee_id, period_id)` to `performance_reviews` would add a database-level backstop; it is optional.

## Run
```bash
cp .env.example .env   # set DATABASE_URL
pip install -r requirements.txt
uvicorn main:app --reload   # docs at http://localhost:8000/docs
pytest                      # no database needed
```
