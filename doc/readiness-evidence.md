# Demo readiness and evidence

**Evidence date:** 2026-10-26  
**Repository:** [rahulpokharkar64/employee-review](https://github.com/rahulpokharkar64/employee-review)  
**Live local API:** `http://127.0.0.1:8000/api`  
**Live local UI:** `http://127.0.0.1:5173`

## Checklist result

| Workstream | Checklist item | Status | Evidence |
|---|---|---|---|
| Discovery | Read client brief and define manager submission → HR register outcome | Complete | [discovery and scope](./discovery-and-scope.md); source [dashboard.jpeg](./dashboard.jpeg). |
| Discovery | Record at least three client questions and assumptions | Complete | Four open questions and explicit working assumptions are recorded in [discovery and scope](./discovery-and-scope.md). Client answers remain to be confirmed. |
| Discovery | Agree mandatory versus optional scope | Complete | Two mandatory screens and optional extensions are separated in [discovery and scope](./discovery-and-scope.md). |
| Discovery | Confirm rating, duplicate, and period rules | Complete | 1–5 integer ratings, unique employee/period, Open-only period, and required comments are documented and tested. |
| Architecture | Inspect OpenAPI request/response fields and ID types | Complete | [OpenAPI JSON](./employee-performance-review-openapi.json) now matches the implementation. Creation uses numeric IDs; review filtering uses employee code plus numeric period ID. |
| Architecture | Verify PostgreSQL tables and sample records | Complete | Live local DB: `employees` 22 rows, `review_periods` 4 rows, `performance_reviews` 25 rows. The original DB had 24 reviews; the demo submission added review 25. The unique-pair constraint is installed and the pair rule has no duplicate rows. |
| API | `GET /api/employees` | Complete | Live HTTP 200; 22 employee rows. Active employees populate the submission dropdown. |
| API | `GET /api/review-periods` | Complete | Live HTTP 200; 4 periods, including Open and Closed periods. |
| API | `GET /api/reviews` | Complete | Live HTTP 200; 25 enriched review objects. |
| API | `POST /api/reviews` | Complete | Live HTTP 201 created review `id=25` for `EMP102` / `H2 2026`; server returned `average_rating=4.33`. |
| API | Duplicate, invalid input, and closed-period behavior | Complete | Live duplicate HTTP 409 (`DUPLICATE_REVIEW`); invalid rating HTTP 422; Closed period HTTP 400 (`REVIEW_PERIOD_CLOSED`). Rejected requests did not add a row. |
| Frontend | Review submission form and styling | Complete | Live UI form includes employee, period, ratings, and comments; [form screenshot](./screenshots/01-review-form.png). |
| Frontend | Populate employee and period dropdowns from GET | Complete | Browser verified live employee and Open period choices from the API. |
| Frontend | Capture input and POST JSON | Complete | Browser submitted numeric employee/period IDs, three ratings, and comments; the live response was HTTP 201. |
| Frontend | HR register rendered from GET results | Complete | The live register showed 25 rows with employee, period, ratings, average, and status; [register screenshot](./screenshots/02-review-register.png). |
| Integration | Show server average, not a client-calculated value | Complete | The form labels the average as server-calculated; the register/detail screens render API `average_rating` to two decimals. Demo review 25 shows `4.33`. |
| Integration | Refresh register after POST | Complete | Browser showed the new review immediately after successful submission. |
| Integration | 409 / 422 / network errors and input preservation | Complete | Live 409 kept employee, period, ratings, and comments in the form. A mocked 422 displayed the field name and retained input; a browser network-abort test showed the API-unavailable message. Live API 422 was also verified. |
| Integration | Record persists after browser reload | Complete | After the live submission, browser reload fetched the same review `id=25`, average `4.33`, from PostgreSQL-backed GET. |
| Demo | GitHub/code link, form and register screenshots, API evidence | Complete | Repository link above, screenshots in `screenshots/`, and live results in this document. |
| Demo | Prepare and run a two-minute team demo | Runbook ready | [Demo runbook](./demo-runbook.md) and [HTML/Markdown slides](./demo-slides.html), [source](./demo-slides.md). A team presentation itself still needs to be scheduled. |
| Stretch | Review details | Complete | `GET /api/reviews/25` returned HTTP 200 with the saved server average; route and details view are implemented. |
| Stretch | Employee/period filters | Complete | Live combined filter `employee_id=EMP102&period_id=4` returned the demo review. |
| Stretch | Summary statistics | Complete | Overview derives review count/ratings from API responses. |
| Stretch | React + TypeScript component structure | Complete | `App.tsx` is the route/data orchestrator; pages and shared UI are separated under `frontend/src/components/`. |

## Runtime evidence

### Read-only GET checks

| Request | Result |
|---|---|
| `GET /api/health` | HTTP 200, database `up` |
| `GET /api/employees` | HTTP 200, 22 rows |
| `GET /api/review-periods` | HTTP 200, 4 rows |
| `GET /api/reviews` | HTTP 200, 25 rows |
| `GET /api/reviews/25` | HTTP 200, average `4.33` |
| `GET /api/reviews?employee_id=EMP102&period_id=4` | HTTP 200, one row |

### Successful live POST response

```json
{
  "id": 25,
  "employee_id": 2,
  "employee_code": "EMP102",
  "employee_name": "Bob Jones",
  "period_id": 4,
  "period_name": "H2 2026",
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "average_rating": 4.33,
  "status": "Completed"
}
```

The response also includes the saved comments and `created_at`. The same review appeared immediately in the register and remained there after reloading the browser.

### Rejected POST checks

| Case | Live result |
|---|---|
| Existing employee/period pair | HTTP 409, `DUPLICATE_REVIEW` |
| Rating outside 1–5 | HTTP 422 |
| Closed review period | HTTP 400, `REVIEW_PERIOD_CLOSED` |

## Build and test results

- Backend: `35 passed` (`python -m pytest backend\tests -q`).
- Frontend production build and TypeScript check: passed (`npm --prefix frontend run build`).
- Frontend lint: passed (`npm --prefix frontend run lint`).
- OpenAPI JSON parse and employee-code filter contract check: passed.
- `git diff --check`: passed.

## Evidence notes and remaining decisions

- The source SQL contains 22 seed reviews. The configured local DB contained 24 before this demo; review 25 was added through the live UI to verify POST → GET → browser reload persistence. Do not submit the same `EMP102` / `H2 2026` pair again.
- A second unused pair was observed for a repeat demo at evidence time; recheck current API data before using it because database state can change.
- The existing DB had no database-level employee/period unique constraint. The guarded migration was applied to the configured local PostgreSQL DB after confirming no duplicates. Fresh setup also creates the constraint.
- The application has no authentication or authorization. Use only trusted demo data and a local/trusted environment.
- The discovery questions are assumptions pending client confirmation. The team demo has been prepared and locally rehearsed; it has not been presented to the client/team.
