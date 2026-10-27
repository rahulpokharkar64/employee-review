# Two-minute demo runbook

## Demo goal

Show the complete manager-to-HR flow: live dropdown data → review submission → server-computed average → refreshed HR register → reload from PostgreSQL.

## Code and screenshots

- Repository: [rahulpokharkar64/employee-review](https://github.com/rahulpokharkar64/employee-review)
- Submission form: [01-review-form.png](./screenshots/01-review-form.png) (draft screenshot; not a saved record).
- Review register: [02-review-register.png](./screenshots/02-review-register.png) (live API data, including saved demo review 25).
- Slides: [HTML slideshow](./demo-slides.html) and [Markdown source](./demo-slides.md).

## Start the demo

Use a PostgreSQL database configured in `backend/.env`. Do not display or share that file. For a new database, create the schema and sample rows once:

```powershell
psql -d employee_details -f .\database\CreateQueries.sql
```

For an existing database created before the unique-pair constraint was added, back it up and apply the guarded migration:

```powershell
psql -d employee_details -f .\database\migrations\001_unique_employee_review_period.sql
```

Run the backend and frontend in separate PowerShell terminals:

```powershell
Set-Location .\backend
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`) and confirm the shell says **API connected**. Verify `http://localhost:8000/api/health` returns `{"status":"ok","database":"up"}`.

## Two-minute talk track

| Time | Presenter action and narration |
|---|---|
| 0:00–0:20 | **Outcome:** “A manager submits one review for an employee and open cycle. HR sees that persisted record in the review register. This replaces a manual handoff with a validated, searchable source of truth.” |
| 0:20–0:45 | Open **New review**. Point out that employee and period options came from `GET /api/employees` and `GET /api/review-periods`; only active employees and Open periods are selectable. |
| 0:45–1:10 | Pick an active employee/open period pair not already used, enter 1–5 ratings and comments, and submit. Show the Network panel or Swagger request: `POST /api/reviews` sends numeric `employee_id`, numeric `period_id`, ratings, and comments. |
| 1:10–1:30 | Explain that the API validates ratings/comments and period status, prevents duplicates, calculates the average, writes PostgreSQL, and returns HTTP 201 with `average_rating`. |
| 1:30–1:50 | Open **Reviews**. The register refreshes automatically via `GET /api/reviews`. Point out employee, cycle, ratings, server average, status, and optional employee/period filters. |
| 1:50–2:00 | Reload the browser. The same saved review returns from the API, demonstrating persistence. Close with the no-authentication limitation and the discovery questions needing client confirmation. |

## Current demo data

The local demo database currently contains 22 employees, 4 periods, and 25 reviews. Review `id=25` was created through the UI for `EMP102` / `H2 2026` with ratings 4, 5, 4 and server average 4.33. That pair is now a duplicate and must not be submitted again.

At evidence time, `EMP103` / `H2 2026` had no review and was active/open. **Re-check the register before the live demonstration**; if the pair has been used, choose another active employee and Open period without an existing review.

## Optional error-path demonstration

- Submit an already-used employee/period pair to show HTTP 409 and the useful duplicate message; the form preserves the entered values.
- Submit invalid data through Swagger/Postman to show HTTP 422. The UI prevents ordinary invalid ratings, and still maps API validation details to field labels.
- Choose a Closed period through Swagger/Postman to show HTTP 400 `REVIEW_PERIOD_CLOSED`.
- Stop/reachability issues show an API-unavailable message and retry action.

## Demo caveats

- Do not submit another review for `EMP102` / `H2 2026`; the successful demo record is already saved.
- The demo has no authentication, authorization, or review editing/deletion flow. Do not expose it to untrusted users or use real sensitive review comments.
- The review-list API returns all matching rows; pagination is client-side.
- The recorded discovery questions are not confirmed client decisions.
- The runbook and local browser flow are prepared; schedule the actual team/client presentation separately.
