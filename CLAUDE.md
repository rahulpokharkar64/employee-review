# Employee Performance Review Management

Shared repo layout:
- `backend/`: FastAPI + PostgreSQL (psycopg 3, connection pool, no ORM). Owned by the backend developer.
- `database/`: SQL for `employees`, `review_periods`, `performance_reviews` (`CreateQueries.sql`, `insertQueries.sql`).
- `frontend/`: not built yet.
- `doc/`: the team's OpenAPI contract (`employee-performance-review-openapi.json`) and dashboard mock-up.

The OpenAPI contract in `doc/` is the spec for every endpoint, status code and error body. Update the code to match it, not the other way round. `backend/README.md` documents what is implemented.

## Business rules
- Ratings are integers 1-5 (quality, delivery, teamwork). `average_rating = ROUND((q + d + t) / 3, 2)`, calculated by the server only.
- Comments are required: non-blank, trimmed before saving.
- One review per employee per period. Enforced in the insert, not by a database constraint (the team's SQL has none).
- Only `Open` review periods accept new reviews.
- `Completed` is a derived status on saved reviews. There is no status column.

## API (base `/api`)
| Method | Path | Notes |
| :-- | :-- | :-- |
| GET | `/employees` | optional `status=Active\|Inactive` |
| GET | `/review-periods` | optional `status=Open\|Closed`, newest first |
| GET | `/reviews` | optional `employee_id`, `period_id` (numeric DB keys); newest first; `[]` when empty; no pagination in the contract |
| GET | `/reviews/{id}` | optional in the contract; 404 `REVIEW_NOT_FOUND` |
| POST | `/reviews` | 201; see error table below |
| GET | `/health` | connectivity check, not in the contract: 200 `ok` or 503 `unavailable` |

Error bodies follow the contract: `{"code": "...", "message": "..."}`. FastAPI validation errors (422) keep FastAPI's `detail` array.

| Status | Code | When |
| :-- | :-- | :-- |
| 400 | `REVIEW_PERIOD_CLOSED` | period is `Closed` |
| 404 | `EMPLOYEE_NOT_FOUND`, `PERIOD_NOT_FOUND`, `REVIEW_NOT_FOUND` | unknown id |
| 409 | `DUPLICATE_REVIEW` | employee already reviewed for that period |
| 422 | FastAPI `detail` | bad input, or unknown request fields |
| 500 | `SERVER_ERROR` | unexpected error |

## Backend rules (`backend/`)
- Layering, one direction: `main.py` (routes, HTTP) -> `models.py` (Pydantic), `service.py` (rules), `repository.py` (all SQL) -> `database.py` (pool).
  No SQL in routes or `service.py`. No HTTP errors in the repository. Business failures raise `ApiError` (`errors.py`).
- All business rules live in `service.py`: existence checks, the open-period rule, duplicate detection, average calculation, filter requirements.
  Routes only parse input and call one service function. Repository functions return data and do not decide anything.
  The one exception is the atomic insert guard in `repository.insert_review`, which must sit next to the SQL to be race-free.
- The server sets `id`, `average_rating`, `created_at`, `employee_code`, `employee_name`, `period_name` and `status`. Clients never send them. Request models use `extra="forbid"`.
- Validate at the edge: Pydantic `Field`, `Query(ge=...)`, `Literal` for enums. Every route declares `response_model`.
- Parameterized SQL only (`%s`). Dynamic `WHERE` is built only from fixed fragments.
- Check-and-write happens in one transaction: take `pg_advisory_xact_lock` on the (employee, period) pair, then `INSERT ... WHERE NOT EXISTS`. Never SELECT then INSERT outside a lock.
- Read endpoints return labelled rows (joins to `employees` and `review_periods`), so the UI never needs a second lookup.
- Tests need no database: `backend/tests/test_api.py` replaces the repository functions with `monkeypatch`. Run `pytest` from `backend/`.
- CORS origins come from `CORS_ORIGINS`, never `*`.
- Auth and role checks are not in the contract, but are required before real use (employees see their own reviews, managers see their reports).

## Commands
- Database: `psql "$DATABASE_URL" -f database/CreateQueries.sql -f database/insertQueries.sql` (the second file re-creates tables, so expect "already exists" errors on a database that already has them).
- API: `cd backend && pip install -r requirements.txt && cp .env.example .env` (set `DATABASE_URL`), then `uvicorn main:app --reload`. Docs at http://127.0.0.1:8000/docs.
- Tests: `cd backend && pytest`.

## Working in this repo
- Branch from the latest `origin/main`, push a branch, and open a PR. Do not push straight to `main`.
- Fetch before every push. Teammates merge into `main` while work is in progress.
