# Employee Performance Review – Frontend

React + TypeScript + Vite dashboard for the Employee Performance Review API (FastAPI backend). The look follows the Testleaf platform: navy sidebar, blue actions, white panels, green status chips and gold stars.

## Screens

| Menu | What it does | API used |
| --- | --- | --- |
| Dashboard | Summary cards, rating distribution chart, 5 most recent reviews | `GET /reviews`, `GET /employees`, `GET /review-periods` |
| My Reviews | Pick **I am** (employee) and see that person's reviews; the choice is remembered in the browser | `GET /employees?status=Active`, `GET /reviews?employee_id=EMP101` |
| Submit Review | Form with employee, open period, 3 star ratings and comments | `GET /employees?status=Active`, `GET /review-periods?status=Open`, `POST /reviews` |
| Reviews | Table with Review Period + Employee filters, pagination, **View** opens Review Details with **Back to List** | `GET /reviews?employee_id=&period_id=`, `GET /reviews/{id}` |
| Employees | ID, name, department, average rating as filled stars, latest comment; search and pagination | `GET /employees`, `GET /reviews` |

## Run it

Prerequisites: Node.js 18+ and the backend running at http://localhost:8000.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Other commands: `npm run build` (type-check + production build in `dist/`), `npm run preview`.

The backend only allows the origins listed in its `CORS_ORIGINS` (default `http://localhost:5173,http://127.0.0.1:5173`), so the dev server uses a fixed port 5173. If you change the port, add the new origin to `backend/.env`.

## Configuration (`.env`)

Copy `.env.example` to `.env` and edit. Vite only exposes variables starting with `VITE_`, and they are visible in the browser, so never put real secrets here. The API has no authentication today, so no credentials are needed.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend base URL including `/api`, no trailing slash |
| `VITE_PAGE_SIZE` | `5` | Rows per page |
| `VITE_APP_NAME` | `Testleaf` | Name beside the logo |

Restart `npm run dev` after changing `.env`. Endpoint paths (`/employees`, `/reviews`, …) are in `src/config.ts`.

## Folder structure

```text
frontend/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md      how the app is organised and how data flows
│   └── API.md               endpoints, request/response shapes, error handling
├── package.json / package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .env / .env.example
├── public/                  favicon.svg, logo.svg
└── src/
    ├── main.tsx             entry point
    ├── App.tsx              only composes Sidebar + PageView
    ├── App.css              all styling (Testleaf look)
    ├── index.css            base reset
    ├── types.ts             interfaces + default values + menu/criteria constants
    ├── config.ts            reads .env, endpoint paths
    ├── api.ts               all fetch calls and error handling
    ├── hooks.ts             useApi (loading / error / reload)
    ├── utils.ts             formatting helpers
    ├── assets/              empty-reviews.svg
    └── components/          one small component per file (see docs/ARCHITECTURE.md)
```

## Things to know

- **My Reviews:** the backend has no login and no "reviewer" field, so My Reviews shows the reviews recorded for the employee chosen in **I am**. When authentication is added, replace `EmployeePicker` with the logged-in user.
- **Form rules come from the backend:** only Active employees and Open periods are offered; a second review for the same employee and period returns a `409` message that the form shows.
- **Ratings start empty** on the form; all three must be 1–5 and comments are required (same as the API).
- **Pagination is client-side** because the API returns all matching reviews without paging.
- The API sends average with 2 decimals; the UI displays 1 decimal (4.67 → 4.7), as in the design.
