# Employee Performance Review Dashboard Architecture

## Purpose

The browser-based administrator dashboard lets the People team review employee
performance details. It provides an overview, review register, employee
directory, review details, and a form to submit new reviews. A persistent
sidebar navigates the Overview, Reviews, and Employees pages.

## Languages, Frameworks, and Tools

| Area | Technology | Use in this project |
| --- | --- | --- |
| Language | TypeScript | UI components, API request/response types, form state |
| UI framework | React 19 | Dashboard components and state management |
| Build and development server | Vite | Local development, hot reload, production bundling |
| Styling | CSS | Responsive dashboard and component styling |
| Linting | Oxlint | Static lint checks (`npm run lint`) |
| Package manager | npm | Installs frontend dependencies and runs scripts |
| API | FastAPI service | Employee, period, review, and health operations |
| Browser transport | Fetch API | Sends HTTP requests and receives JSON |

The frontend project and scripts live in [`../frontend`](../frontend). Run the
development server, production build, and linter from that directory:

```powershell
npm install
npm run dev
npm run build
npm run lint
```

The API is served locally at `http://localhost:8000`; its Swagger UI is at
`http://localhost:8000/docs`. The browser calls the API base path
`http://localhost:8000/api`. Set `VITE_API_BASE_URL` at build time to use a
different API base URL.

## Architecture and Request Flow

```text
Browser
  |
  v
React application (frontend/src)
  |-- App.tsx: shared data loading, routes, API state, and navigation
  |-- components/AppShell.tsx: persistent shell and navigation
  |-- components/OverviewPage.tsx: summary dashboard
  |-- components/EmployeesPage.tsx: employee directory
  |-- components/ReviewPages.tsx: submit, register, and detail screens
  |-- components/shared.tsx: reusable presentational components
  |-- components/utils.ts: formatting, error, and avatar helpers
  |-- api.ts: typed Fetch API client and API error handling
  |-- types.ts: employee, review period, and review contracts
  |-- styles.css: responsive presentation
  |
  | HTTP / JSON
  v
FastAPI routes (backend/main.py)
  |
  v
Service rules (backend/service.py) -> SQL repository (backend/repository.py)
  |
  v
PostgreSQL (database/)
```

The frontend calls FastAPI directly; there is no BFF. The API owns
validation, average rating calculation, duplicate-review enforcement, period
rules, and persistence. The UI owns presentation, filtering controls, form
state, and dashboard summaries calculated from API responses.

## API Operations Used

| Operation | Dashboard behavior |
| --- | --- |
| `GET /api/employees` | Populate the employee directory and review form |
| `GET /api/review-periods` | Show review cycles and populate open-period choices |
| `GET /api/reviews` | Load all reviews or filter by employee code and numeric `period_id` |
| `GET /api/reviews/{id}` | Load review details when an administrator opens a review |
| `POST /api/reviews` | Submit ratings and comments for one employee and period |

The review-list endpoint expects `employee_id` to be the displayed employee
code (for example, `EMP101`) and `period_id` to be the numeric review-period
database ID. Review creation instead expects numeric employee and period
database IDs. The UI sends only those IDs, three ratings, and comments on
creation. The API computes `average_rating`; the UI displays the returned
server-calculated value in the register and details screen.

## Dashboard Behavior

- Load employees, periods, and reviews from the API on startup.
- Filter the review register through the API by employee and/or review period.
- Paginate filtered review results in the browser (five rows per page).
- Fetch a review by ID for the dedicated Review Details route.
- Submit reviews only for Active employees and Open periods, and show API
  validation, duplicate, and closed-period errors without hiding failures.
- Refresh the review data after a successful submission.
- Display the server-calculated average at two-decimal precision in the review
  register and detail view.
- Display explicit loading, empty, and API/network error states.

The current API contract returns all matching review rows without pagination,
so the Review List paginates the loaded results in the browser. For larger
organizations, server-side pagination would be a separate API enhancement.

The schema setup script enforces a unique employee/period pair. Existing
databases can apply the guarded migration at
[`../database/migrations/001_unique_employee_review_period.sql`](../database/migrations/001_unique_employee_review_period.sql).

## Error and State Handling

- Show loading states while initial data, filtered reviews, or details load.
- Show API and network failures in the relevant page or form.
- Treat an empty review response as an empty result, not an error.
- Keep API validation authoritative; client-side checks only improve usability.
- Use the server's calculated average and returned review details as the source
  of truth.

## Boundaries and Non-Goals

- The dashboard is an administrator-facing UI prototype; it does not
  implement authentication or role-based authorization.
- The frontend is not the source of truth for employee, review, or period data.
- The frontend must not connect directly to PostgreSQL.
- Review rules and rating calculations remain in the FastAPI service.
- A same-origin BFF, deployment configuration, and automated browser tests are
  not currently included.
- Do not expose this prototype to untrusted users without appropriate
  authentication, authorization, privacy, and operational safeguards.
