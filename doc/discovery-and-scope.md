# Discovery and agreed demo scope

**Project:** Employee Performance Review Dashboard  
**Source brief:** [requirements and design snapshot](./dashboard.jpeg)  
**Code:** [GitHub repository](https://github.com/rahulpokharkar64/employee-review)

## Business outcome

Replace an informal manager-to-HR handoff with a reliable, reviewable workflow:

1. A manager selects an active employee and an open review period.
2. They rate quality, delivery, and teamwork from 1 to 5 and enter required comments.
3. The API validates the request, enforces the period and duplicate rules, calculates the average, and stores the review in PostgreSQL.
4. HR sees the saved review in a searchable/filterable register, with the server-calculated average and a read-only detail view.

The manager's successful submission is the source of the HR register entry. The browser does not calculate or persist review averages itself.

## Discovery questions and working assumptions

These questions are recorded for client confirmation; the repository does not contain client answers.

| # | Question to confirm | Working assumption for this demo | Why it matters |
|---|---|---|---|
| 1 | Which roles may create reviews and which HR users may view them? | The demo uses an administrator persona. Authentication and authorization are not implemented. | Access control and employee-data privacy are production prerequisites. |
| 2 | Who creates, opens, closes, or reopens review periods? | Periods are configured in PostgreSQL; only a period whose status is `Open` accepts a new review. | Determines period administration and exception handling. |
| 3 | Is the uniqueness rule one review per employee and period, or one per manager as well? | Exactly one review per employee/period pair; manager identity is not stored. | A different rule changes the schema, request model, and duplicate handling. |
| 4 | What are the feedback retention, visibility, and correction requirements? | Comments are required, limited to 2,000 characters, and visible to the administrator in this prototype. | Sensitive feedback needs a retention, audit, and access policy before production. |

## Mandatory scope and definition of done

| Mandatory screen | User outcome | Implemented evidence |
|---|---|---|
| Review submission | Load live employee and open-period choices, capture three 1–5 ratings and comments, and submit JSON. | React form in `frontend/src/components/ReviewPages.tsx`; live form screenshot in [01-review-form.png](./screenshots/01-review-form.png). |
| HR review register | Read saved reviews and show employee, period, ratings, server average, and status. | Register in `frontend/src/components/ReviewPages.tsx`; live register screenshot in [02-review-register.png](./screenshots/02-review-register.png). |

Four required APIs:

| Method and route | Contract and purpose |
|---|---|
| `GET /api/employees` | Returns employee records; the submission dropdown uses active employees. `employees.id` is the numeric foreign key; `employee_id` is the display code. |
| `GET /api/review-periods` | Returns configured periods; the submission dropdown uses periods with status `Open`. |
| `GET /api/reviews` | Returns the HR register array; optional `employee_id` is the employee business code (for example `EMP101`) and `period_id` is a numeric database ID. |
| `POST /api/reviews` | Accepts employee/period numeric IDs, three ratings, and comments. Returns HTTP 201 with the saved review and server-calculated `average_rating`. |

## Agreed rules and identifier map

- Ratings are integers from 1 through 5, inclusive.
- Comments are required, non-blank, and at most 2,000 characters.
- Only `Open` review periods accept submissions.
- An employee may have at most one review per period. The API enforces this atomically; PostgreSQL also has a unique constraint on `(employee_id, period_id)`.
- Duplicate submission returns HTTP 409. Invalid request data returns HTTP 422. A closed period is rejected with HTTP 400.
- The API calculates and stores the average rounded to two decimal places. `average_rating`, labels, status, and generated IDs are not accepted from the client.
- `POST` uses numeric `employees.id` and `review_periods.id`; review-list filtering uses the employee business code plus numeric `period_id`.

## Optional/stretch scope

The code also includes the optional review details screen (`GET /api/reviews/{id}`), employee and period filters, summary statistics, and a React + TypeScript component structure. These are working extensions, not prerequisites for the two mandatory screens.

## Boundaries

No authenticated client brief responses are present in the repository. The questions above and their assumptions must be confirmed with the client. This demo is not a production approval: authentication, authorization, audit policy, and operational deployment are out of scope.
