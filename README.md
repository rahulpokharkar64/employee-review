# Employee Performance Review Dashboard

An administrator-facing employee performance review dashboard. The React
frontend consumes the FastAPI backend and provides an overview, review
register, employee directory, review details, and review submission.

## Project structure

```text
backend/       FastAPI API and backend tests
database/      PostgreSQL table definitions and sample data
doc/           Requirements, API contract, and architecture
frontend/      React, TypeScript, and Vite dashboard
```

See the [architecture document](doc/architecture.md) for the UI structure,
request flow, API responsibilities, and current limitations. The API contract
and screen/database requirements are available in
[`doc/employee-performance-review-openapi.json`](doc/employee-performance-review-openapi.json)
and [`doc/dashboard.jpeg`](doc/dashboard.jpeg).

## Requirements

- Python 3.10 or newer
- Node.js and npm
- PostgreSQL

## Configure PostgreSQL

Create an empty PostgreSQL database, then run the single schema and sample data
script from the repository root:

```powershell
psql -d employee_details -f .\database\CreateQueries.sql
```

The script creates all three tables and inserts sample records. It does not
create the database itself. Run it once against a fresh/empty database; it is
not a migration and is not safe to run repeatedly.

## Run the backend

In a PowerShell terminal:

```powershell
cd .\backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to a PostgreSQL connection URL for
your database, for example:

```text
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/employee_details
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Then install the Python dependencies and start FastAPI:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`; interactive API
documentation is at `http://localhost:8000/docs`. The API endpoints use the
`/api` base path.

## Run the frontend

In a second terminal:

```powershell
cd .\frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally
`http://localhost:5173`). The frontend defaults to
`http://localhost:8000/api`. To configure another API base URL, set
`VITE_API_BASE_URL` before starting/building the frontend, for example:

```powershell
$env:VITE_API_BASE_URL = "http://localhost:8000/api"
npm run dev
```

## Frontend commands

Run from `frontend/`:

```powershell
npm run dev
npm run build
npm run lint
```

## Backend tests

Run from `backend/` after installing its requirements:

```powershell
python -m pytest
```

The backend tests use in-memory fakes and do not require a running database.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API/database connectivity |
| `GET` | `/api/employees` | List employees; optionally filter by status |
| `GET` | `/api/review-periods` | List review periods; optionally filter by status |
| `GET` | `/api/reviews` | List reviews; optionally filter by employee code and numeric period ID |
| `GET` | `/api/reviews/{id}` | Retrieve one review |
| `POST` | `/api/reviews` | Submit a review |

The review-list `employee_id` filter takes the employee code (for example,
`EMP101`), while review creation takes the numeric employee database ID.
Ratings must be integers from 1 to 5 and comments are required. The API
calculates the average rating, only accepts submissions for open periods, and
prevents duplicate reviews for the same employee and period. See the Swagger
documentation or the OpenAPI file for request and response details.

## Current limitations

- The dashboard has no authentication or role-based authorization. Do not
  expose it to untrusted users as-is.
- The current API returns all matching reviews without pagination.
- Dashboard summary figures are derived from the reviews returned by the API;
  there is no separate analytics endpoint.
