# Architecture

## Idea in one minute
`main.tsx` → `App.tsx` → `Sidebar` (menu) + `PageView` (chooses the screen). Each screen is a `*Page` component that loads data through `api.ts` using the `useApi` hook and builds the screen from small components. There is no router: the selected menu item is a single piece of state in `App.tsx`.

```text
App
├── Sidebar
└── PageView
    ├── DashboardPage   → SummaryCards, RatingChart, ReviewTable
    ├── MyReviewsPage   → EmployeePicker + ReviewBrowser
    ├── SubmitReviewPage→ Header + ReviewForm → StarInput, Alert
    ├── ReviewsPage     → ReviewFilters + ReviewBrowser
    └── EmployeesPage   → EmployeeSearch, EmployeeTable → EmployeeRow, Pagination
```

`ReviewBrowser` is shared by Reviews and My Reviews: it shows the toolbar, `ReviewTable` and `Pagination`, and swaps to `ReviewDetails` when **View** is clicked (Back to List returns, filters are kept).

## Components (`src/components/`)

| Component | Responsibility |
| --- | --- |
| `Sidebar` | Logo and the five menu items |
| `PageView` | Maps the menu key to a page |
| `Header` | Panel title bar, optional right-side action |
| `DashboardPage`, `MyReviewsPage`, `SubmitReviewPage`, `ReviewsPage`, `EmployeesPage` | The five screens |
| `ReviewForm` | Submit Review form: loads employees/periods, validates, calls `POST /reviews` |
| `StarInput` | Clickable 1–5 stars (keyboard accessible) |
| `StarRating` | Read-only filled/empty stars |
| `ReviewFilters` | Review Period + Employee dropdowns and Search |
| `EmployeePicker` | "I am" dropdown for My Reviews |
| `ReviewBrowser` | Table + pagination + switch to details |
| `ReviewTable`, `ReviewRow` | Review list rows |
| `ReviewDetails` | Review Details screen (`GET /reviews/{id}`) |
| `SummaryCards`, `RatingChart` | Dashboard figures and bar chart (plain CSS, no chart library) |
| `EmployeeSearch`, `EmployeeTable`, `EmployeeRow` | Employees screen |
| `Pagination` | "Showing 1 to 5 of 12 reviews" and page buttons |
| `Alert`, `StatusMessage` | Success/error banner; loading, error and empty states |
| `Icon` | Inline SVG menu/search icons |

## Data flow
1. `config.ts` reads `.env` once (`API_BASE_URL`, `PAGE_SIZE`, `ENDPOINTS`).
2. `api.ts` is the only file that calls `fetch`. It builds URLs, sends JSON, and converts backend errors into `ApiRequestError` messages.
3. `useApi(fetcher, deps)` in `hooks.ts` returns `{ data, loading, error, reload }` and refetches when `deps` change.
4. Pages pass data down as props. Types and defaults live in `types.ts`.

## Dashboard figures
There is no analytics endpoint, so the dashboard computes everything in the browser from `GET /reviews`: total, mean of `average_rating`, employees reviewed (distinct `employee_id`), and the chart counts reviews by rounded average (1–5). Open periods come from `GET /review-periods`.

## Employees screen rating
The rating shown is the mean `average_rating` of all that employee's reviews (stars are rounded to the nearest whole star); the comment is from their newest review.

## Styling
All styles are in `App.css` with colour variables at the top (`--navy`, `--blue`, `--star`, …). Below 820px width the sidebar becomes a top bar.

## Possible next steps
Authentication and "reviews I gave" (needs a reviewer field in the API), server-side pagination, an analytics endpoint, a router so pages have URLs.
