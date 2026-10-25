import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ApiError,
  createReview,
  getEmployees,
  getReview,
  getReviewPeriods,
  getReviews,
} from "./api";
import type { Employee, Review, ReviewCreate, ReviewPeriod } from "./types";

type RatingField = "quality_rating" | "delivery_rating" | "teamwork_rating";

const PAGE_SIZE = 5;

function App() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<ReviewPeriod[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  const [notice, setNotice] = useState("");

  const loadReferenceData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [employeeData, periodData, reviewData] = await Promise.all([
        getEmployees(),
        getReviewPeriods(),
        getReviews(),
      ]);
      setEmployees(employeeData);
      setPeriods(periodData);
      setReviews(reviewData);
      setApiConnected(true);
    } catch (error) {
      setApiConnected(false);
      setDataError(getErrorMessage(error));
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  const refreshReviews = useCallback(async (
    employeeCode?: string,
    periodId?: string,
  ) => {
    setDataError("");
    try {
      const result = await getReviews(employeeCode, periodId);
      setReviews(result);
      setApiConnected(true);
      return result;
    } catch (error) {
      setApiConnected(false);
      setDataError(getErrorMessage(error));
      return null;
    }
  }, []);

  const openPeriods = useMemo(
    () => periods.filter((period) => period.status === "Open"),
    [periods],
  );

  return (
    <div className="app-shell">
      <AppShell
        apiConnected={apiConnected}
        dataError={dataError}
        dataLoading={dataLoading}
        notice={notice}
        onDismissNotice={() => setNotice("")}
        onRetry={() => void loadReferenceData()}
      >
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/overview" replace />}
          />
          <Route
            path="/overview"
            element={
              <OverviewPage
                employees={employees}
                periods={periods}
                reviews={reviews}
                loading={dataLoading}
                onOpenReview={(review) => navigate(`/reviews/${review.id}`)}
                onNavigate={navigate}
              />
            }
          />
          <Route
            path="/submit-review"
            element={
              <SubmitReviewPage
                employees={employees.filter(
                  (employee) => employee.status === "Active",
                )}
                periods={openPeriods}
                onCreated={async (review) => {
                  setNotice(
                    `Review submitted for ${review.employee_name} — ${review.period_name}.`,
                  );
                  await refreshReviews();
                  navigate("/reviews");
                }}
              />
            }
          />
          <Route
            path="/reviews"
            element={
              <ReviewListPage
                employees={employees}
                periods={periods}
                reviews={reviews}
                loading={dataLoading}
                onFilter={refreshReviews}
              />
            }
          />
          <Route
            path="/employees"
            element={<EmployeesPage employees={employees} reviews={reviews} />}
          />
          <Route
            path="/reviews/:reviewId"
            element={<ReviewDetailsPage />}
          />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AppShell>
    </div>
  );

}

function AppShell({
  apiConnected,
  dataError,
  dataLoading,
  notice,
  onDismissNotice,
  onRetry,
  children,
}: {
  apiConnected: boolean;
  dataError: string;
  dataLoading: boolean;
  notice: string;
  onDismissNotice: () => void;
  onRetry: () => void;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const detailRoute =
    location.pathname.startsWith("/reviews/");
  const title = detailRoute
    ? "Review Details"
    : location.pathname === "/reviews"
      ? "Review List"
      : location.pathname === "/employees"
        ? "Employees"
        : location.pathname === "/submit-review"
          ? "Submit Review"
          : "Overview";

  return (
    <>
      <aside className="sidebar">
        <NavLink className="brand" to="/overview" aria-label="PeoplePulse home">
          <BrandMark />
          <span className="brand-copy">
            <strong>PeoplePulse</strong>
            <small>EMPLOYEE REVIEWS</small>
          </span>
        </NavLink>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <SidebarLink
            icon={<Icon name="grid" />}
            label="Overview"
            to="/overview"
          />
          <SidebarLink
            icon={<Icon name="document" />}
            label="Reviews"
            to="/reviews"
          />
          <SidebarLink
            icon={<Icon name="people" />}
            label="Employees"
            to="/employees"
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="shield" />
            <p>Thoughtful feedback helps everyone grow.</p>
          </div>
          <div className="user-profile">
            <div className="avatar avatar-admin">AD</div>
            <div className="user-details">
              <strong>Administrator</strong>
              <span>People team</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>People Operations</span>
            <span className="breadcrumb-chevron">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="connection-indicator">
              <span
                className={`connection-dot${apiConnected ? "" : " connection-dot-offline"}`}
              />
              {dataLoading
                ? "Connecting to API…"
                : apiConnected
                  ? "API connected"
                  : "API unavailable"}
            </span>
            <div className="topbar-avatar" aria-label="Administrator">
              AD
            </div>
          </div>
        </header>

        <div className="page-content">
          {dataError && (
            <div className="alert alert-error" role="alert">
              <Icon name="alert" />
              <span>{dataError}</span>
              <button className="alert-action" onClick={onRetry}>
                Retry
              </button>
            </div>
          )}
          {notice && (
            <div className="alert alert-success" role="status">
              <Icon name="check" />
              <span>{notice}</span>
              <button
                className="alert-dismiss"
                aria-label="Dismiss success message"
                onClick={onDismissNotice}
              >
                ×
              </button>
            </div>
          )}
          {location.pathname !== "/submit-review" &&
            location.pathname !== "/reviews" &&
            location.pathname !== "/employees" &&
            !detailRoute && (
              <PageHeading
                eyebrow="EMPLOYEE PERFORMANCE"
                title="Performance overview"
                description="A clear view of your people and their progress."
                action={
                  <button
                    className="button button-primary"
                    onClick={() => navigate("/submit-review")}
                  >
                    <Icon name="plus" /> New review
                  </button>
                }
              />
            )}
          {children}
        </div>
      </main>
    </>
  );
}

function SidebarLink({
  icon,
  label,
  to,
  active,
}: {
  icon: ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `nav-button${isActive || active ? " nav-button-active" : ""}`
      }
      to={to}
      end={to !== "/reviews"}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function OverviewPage({
  employees,
  periods,
  reviews,
  loading,
  onOpenReview,
  onNavigate,
}: {
  employees: Employee[];
  periods: ReviewPeriod[];
  reviews: Review[];
  loading: boolean;
  onOpenReview: (review: Review) => void;
  onNavigate: (path: string) => void;
}) {
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.average_rating, 0) /
      reviews.length
    : null;
  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;
  const openPeriods = periods.filter(
    (period) => period.status === "Open",
  );
  const departmentStats = new Map<
    string,
    { total: number; count: number }
  >();
  reviews.forEach((review) => {
    const department =
      employees.find((employee) => employee.id === review.employee_id)
        ?.department || "Unassigned";
    const current = departmentStats.get(department) ?? { total: 0, count: 0 };
    current.total += review.average_rating;
    current.count += 1;
    departmentStats.set(department, current);
  });
  const departments = [...departmentStats.entries()]
    .map(([name, stats]) => ({
      name,
      average: stats.total / stats.count,
      count: stats.count,
    }))
    .sort((left, right) => right.average - left.average)
    .slice(0, 5);

  return (
    <>
      <section className="stats-grid" aria-label="Performance summary">
        <StatCard
          label="Average rating"
          value={average === null ? "—" : average.toFixed(2)}
          suffix={average === null ? undefined : "/ 5"}
          footnote="Across submitted reviews"
          icon={<Icon name="star" />}
          tone="purple"
        />
        <StatCard
          label="Reviews completed"
          value={String(reviews.length)}
          footnote="Submitted reviews"
          icon={<Icon name="document" />}
          tone="blue"
        />
        <StatCard
          label="Active employees"
          value={String(activeCount)}
          footnote={`Of ${employees.length} employees`}
          icon={<Icon name="people" />}
          tone="green"
        />
        <StatCard
          label="Open periods"
          value={String(openPeriods.length)}
          footnote="Accepting new reviews"
          icon={<Icon name="calendar" />}
          tone="orange"
        />
      </section>

      <div className="overview-grid">
        <section className="panel department-panel">
          <div className="panel-heading">
            <div>
              <h2>Performance by department</h2>
              <p>Average review score out of 5</p>
            </div>
          </div>
          {loading ? (
            <LoadingInline label="Loading performance data" />
          ) : departments.length ? (
            <div className="department-chart">
              {departments.map((department, index) => (
                <div className="department-row" key={department.name}>
                  <div className="department-label">
                    <span className={`department-dot department-dot-${index + 1}`} />
                    <span>{department.name}</span>
                    <span className="department-count">{department.count}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-fill-${index + 1}`}
                      style={{ width: `${(department.average / 5) * 100}%` }}
                    />
                  </div>
                  <strong className="bar-score">
                    {department.average.toFixed(1)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No department ratings yet"
              description="Ratings will appear here after reviews are submitted."
            />
          )}
          <button
            className="text-link department-link"
            onClick={() => onNavigate("/employees")}
          >
            Explore employees <span>→</span>
          </button>
        </section>

        <section className="panel period-panel">
          <div className="panel-heading">
            <div>
              <h2>Review periods</h2>
              <p>Configured review cycles</p>
            </div>
            <Icon name="calendar" />
          </div>
          {periods.length ? (
            <div className="period-list">
              {periods.slice(0, 4).map((period) => (
                <div className="period-item" key={period.id}>
                  <div className="period-calendar">
                    <span>{formatMonth(period.start_date)}</span>
                    <strong>
                      {new Date(`${period.start_date}T00:00:00`).getDate()}
                    </strong>
                  </div>
                  <div className="period-info">
                    <strong>{period.name}</strong>
                    <span>
                      {formatDate(period.start_date)} – {formatDate(period.end_date)}
                    </span>
                  </div>
                  <StatusBadge status={period.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No review periods"
              description="Configured cycles will appear here."
            />
          )}
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-heading recent-heading">
          <div>
            <h2>Recent reviews</h2>
            <p>The latest submitted feedback across your organization</p>
          </div>
          <button
            className="button button-secondary"
            onClick={() => onNavigate("/reviews")}
          >
            View all reviews <span>→</span>
          </button>
        </div>
        {loading ? (
          <LoadingInline label="Loading reviews" />
        ) : reviews.length ? (
          <ReviewTable
            reviews={reviews.slice(0, 5)}
            onOpenReview={onOpenReview}
          />
        ) : (
          <EmptyState
            title="No reviews found"
            description="Submitted reviews will show up here."
          />
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  suffix,
  footnote,
  icon,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  footnote: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-topline">
        <span>{label}</span>
        <span className={`stat-icon stat-icon-${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">
        {value}
        {suffix && <span>{suffix}</span>}
      </div>
      <div className="stat-footnote">{footnote}</div>
    </article>
  );
}

function EmployeesPage({
  employees,
  reviews,
}: {
  employees: Employee[];
  reviews: Review[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filteredEmployees = employees.filter((employee) => {
    const text = [
      employee.name,
      employee.employee_id,
      employee.department ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (!status || employee.status === status)
    );
  });

  return (
    <>
      <PageHeading
        eyebrow="PEOPLE DIRECTORY"
        title="Employees"
        description="Employee performance summaries from completed reviews."
      />
      <section className="panel directory-panel">
        <div className="directory-toolbar">
          <div>
            <h2>All employees</h2>
            <p>{filteredEmployees.length} employees</p>
          </div>
          <div className="directory-controls">
            <label className="search-input">
              <Icon name="search" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees"
                aria-label="Search employees"
              />
            </label>
            <select
              className="employee-status-filter"
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {filteredEmployees.length ? (
          <div className="employee-grid">
            {filteredEmployees.map((employee) => {
              const employeeReviews = reviews.filter(
                (review) => review.employee_id === employee.id,
              );
              const average = employeeReviews.length
                ? employeeReviews.reduce(
                    (sum, review) => sum + review.average_rating,
                    0,
                  ) / employeeReviews.length
                : null;
              return (
                <article className="employee-card" key={employee.id}>
                  <div className="employee-card-top">
                    <div className={`avatar avatar-large ${avatarTone(employee.id)}`}>
                      {initials(employee.name)}
                    </div>
                    <StatusBadge status={employee.status} />
                  </div>
                  <h3>{employee.name}</h3>
                  <p className="employee-code">{employee.employee_id}</p>
                  <p className="employee-department">
                    {employee.department || "Department not assigned"}
                  </p>
                  {employee.email && (
                    <a
                      className="employee-email"
                      href={`mailto:${employee.email}`}
                    >
                      {employee.email}
                    </a>
                  )}
                  <div className="employee-card-stats">
                    <div>
                      <strong>{average === null ? "—" : average.toFixed(1)}</strong>
                      <span>Average rating</span>
                    </div>
                    <div>
                      <strong>{employeeReviews.length}</strong>
                      <span>Reviews</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No employees found"
            description="Try another employee name or status."
          />
        )}
      </section>
    </>
  );
}

function SubmitReviewPage({
  employees,
  periods,
  onCreated,
}: {
  employees: Employee[];
  periods: ReviewPeriod[];
  onCreated: (review: Review) => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [ratings, setRatings] = useState<Record<RatingField, number>>({
    quality_rating: 0,
    delivery_rating: 0,
    teamwork_rating: 0,
  });
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratingValues = Object.values(ratings);
  const average =
    ratingValues.every((rating) => rating > 0)
      ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / 3).toFixed(2)
      : "—";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldError("");

    if (!employeeId || !periodId) {
      setFieldError("Select an employee and an open review period.");
      return;
    }
    if (ratingValues.some((rating) => rating < 1 || rating > 5)) {
      setFieldError("Choose a star rating for all three criteria.");
      return;
    }
    if (!comments.trim()) {
      setFieldError("Comments are required.");
      return;
    }

    const payload: ReviewCreate = {
      employee_id: Number(employeeId),
      period_id: Number(periodId),
      ...ratings,
      comments: comments.trim(),
    };

    setSubmitting(true);
    try {
      const review = await createReview(payload);
      setEmployeeId("");
      setPeriodId("");
      setRatings({
        quality_rating: 0,
        delivery_rating: 0,
        teamwork_rating: 0,
      });
      setComments("");
      await onCreated(review);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="PERFORMANCE REVIEW"
        title="Submit a review"
        description="Recognize achievements and provide clear, constructive feedback."
      />
      <div className="submit-layout">
        <section className="panel submit-panel">
          <div className="panel-heading form-heading">
            <div className="heading-with-icon">
              <span className="heading-icon"><Icon name="edit" /></span>
              <div>
                <h2>Review form</h2>
                <p>Fields marked with * are required</p>
              </div>
            </div>
            <span className="form-step">NEW REVIEW</span>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <Icon name="alert" />
              <span>{error}</span>
            </div>
          )}
          {fieldError && (
            <div className="form-error" role="alert">{fieldError}</div>
          )}

          <form onSubmit={(event) => void handleSubmit(event)}>
            <div className="form-grid">
              <label className="form-field">
                <span>Employee <b>*</b></span>
                <select
                  required
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employee_id} — {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Review period <b>*</b></span>
                <select
                  required
                  value={periodId}
                  onChange={(event) => setPeriodId(event.target.value)}
                >
                  <option value="">Select open period</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="criteria-heading">
              <div>
                <h3>Performance ratings <b>*</b></h3>
                <p>Rate each area from 1 (needs improvement) to 5 (excellent).</p>
              </div>
              <span className="rating-legend">
                <span>★</span> Select a rating
              </span>
            </div>

            <RatingInput
              label="Quality of Work"
              description="Accuracy, craftsmanship, and attention to detail"
              value={ratings.quality_rating}
              onChange={(value) =>
                setRatings((current) => ({ ...current, quality_rating: value }))
              }
            />
            <RatingInput
              label="Delivery & Ownership"
              description="Reliability, follow-through, and outcomes"
              value={ratings.delivery_rating}
              onChange={(value) =>
                setRatings((current) => ({ ...current, delivery_rating: value }))
              }
            />
            <RatingInput
              label="Teamwork & Collaboration"
              description="Communication, support, and shared success"
              value={ratings.teamwork_rating}
              onChange={(value) =>
                setRatings((current) => ({ ...current, teamwork_rating: value }))
              }
            />

            <div className="comments-heading">
              <label htmlFor="review-comments">Overall comments <b>*</b></label>
              <span>Required · up to 2,000 characters</span>
            </div>
            <textarea
              id="review-comments"
              maxLength={2000}
              required
              rows={5}
              placeholder="Share feedback, strengths, achievements, or opportunities for growth…"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
            />
            <div className="textarea-footer">
              <span>Keep feedback specific, constructive, and kind.</span>
              <span>{comments.length}/2000</span>
            </div>

            <div className="form-footer">
              <div className="average-preview">
                <span>Overall average</span>
                <strong>{average}<small>/ 5</small></strong>
                <span className="preview-note">Calculated automatically</span>
              </div>
              <button
                className="button button-primary submit-button"
                type="submit"
                disabled={submitting || !employees.length || !periods.length}
              >
                {submitting ? (
                  <>
                    <span className="button-spinner" /> Submitting…
                  </>
                ) : (
                  <>
                    Submit review <Icon name="arrow" />
                  </>
                )}
              </button>
            </div>
            {!employees.length && (
              <p className="form-note">No active employees are available.</p>
            )}
            {!!employees.length && !periods.length && (
              <p className="form-note">There are no open review periods.</p>
            )}
          </form>
        </section>

        <aside className="submit-aside">
          <section className="guidance-card">
            <span className="guidance-icon"><Icon name="sparkle" /></span>
            <h3>Make feedback meaningful</h3>
            <p>
              Great reviews are specific, balanced, and focused on helping
              people succeed.
            </p>
            <ul>
              <li><Icon name="check" /> Share real examples</li>
              <li><Icon name="check" /> Recognize strengths</li>
              <li><Icon name="check" /> Offer actionable next steps</li>
            </ul>
          </section>
          <section className="rating-scale-card">
            <h3>Rating guide</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div className="scale-row" key={rating}>
                <strong>{rating}</strong>
                <span className="scale-stars">{"★".repeat(rating)}</span>
                <span>{ratingLabel(rating)}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}

function ReviewListPage({
  employees,
  periods,
  reviews,
  loading,
  onFilter,
}: {
  employees: Employee[];
  periods: ReviewPeriod[];
  reviews: Review[];
  loading: boolean;
  onFilter: (employeeCode?: string, periodId?: string) => Promise<Review[] | null>;
}) {
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [page, setPage] = useState(1);
  const [filterLoading, setFilterLoading] = useState(false);

  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const visibleReviews = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilterLoading(true);
    const result = await onFilter(employeeCode, periodId);
    if (result) setPage(1);
    setFilterLoading(false);
  }

  function resetFilters() {
    setEmployeeCode("");
    setPeriodId("");
    setFilterLoading(true);
    void onFilter().then((result) => {
      if (result) setPage(1);
      setFilterLoading(false);
    });
  }

  return (
    <>
      <PageHeading
        eyebrow="ALL SUBMITTED REVIEWS"
        title="Review list"
        description="Search, filter, and open employee performance reviews."
      />
      <section className="panel register-panel">
        <form className="filters" onSubmit={(event) => void handleSubmit(event)}>
          <label className="filter-field">
            <span>Review period</span>
            <select
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
            >
              <option value="">All periods</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Employee</span>
            <select
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
            >
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.employee_id}>
                  {employee.employee_id} — {employee.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-primary filter-submit"
            type="submit"
            disabled={filterLoading || loading}
          >
            <Icon name="search" />
            {filterLoading ? "Searching…" : "Search"}
          </button>
          <button
            className="button button-secondary reset-filter"
            type="button"
            onClick={resetFilters}
            disabled={filterLoading || loading}
          >
            Reset
          </button>
        </form>

        <div className="table-summary">
          <div>
            <h2>Performance reviews</h2>
            <p>
              {loading || filterLoading
                ? "Loading matching reviews…"
                : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"} found`}
            </p>
          </div>
          <span className="result-count">
            {reviews.length} {reviews.length === 1 ? "record" : "records"}
          </span>
        </div>

        {loading || filterLoading ? (
          <LoadingInline label="Loading review register" />
        ) : reviews.length ? (
          <>
            <ReviewTable
              reviews={visibleReviews}
              onOpenReview={(review) => navigate(`/reviews/${review.id}`)}
            />
            <Pagination
              page={page}
              pageCount={pageCount}
              total={reviews.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            title="No reviews found"
            description="Try a different employee or review period."
          />
        )}
      </section>
    </>
  );
}

function ReviewTable({
  reviews,
  onOpenReview,
}: {
  reviews: Review[];
  onOpenReview: (review: Review) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="review-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee name</th>
            <th>Period</th>
            <th>Ratings</th>
            <th>Average</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="employee-code-cell">{review.employee_code}</td>
              <td>
                <div className="table-employee">
                  <div className={`avatar ${avatarTone(review.employee_id)}`}>
                    {initials(review.employee_name)}
                  </div>
                  <strong>{review.employee_name}</strong>
                </div>
              </td>
              <td>{review.period_name}</td>
              <td className="rating-cell">
                {review.quality_rating}, {review.delivery_rating},{" "}
                {review.teamwork_rating}
              </td>
              <td>
                <span className="average-pill">
                  {review.average_rating.toFixed(1)}
                </span>
              </td>
              <td><StatusBadge status={review.status} /></td>
              <td>
                <button
                  className="table-action"
                  onClick={() => onOpenReview(review)}
                >
                  View <span>→</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewDetailsPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = Number(reviewId);
    if (!Number.isInteger(id) || id < 1) {
      setError("Select a review from the review list to see its details.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    void getReview(id)
      .then((result) => {
        if (active) setReview(result);
      })
      .catch((detailError: unknown) => {
        if (active) setError(getErrorMessage(detailError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reviewId]);

  return (
    <>
      <PageHeading
        eyebrow="EMPLOYEE PERFORMANCE"
        title="Review details"
        description="Ratings and manager comments for this review period."
        action={
          <button
            className="button button-secondary"
            onClick={() => {
                navigate("/reviews");
              }}
          >
            <Icon name="arrow-left" /> Back to list
          </button>
        }
      />
      {loading ? (
        <LoadingInline label="Loading review details" />
      ) : error ? (
        <section className="panel">
          <EmptyState title="Review unavailable" description={error} />
        </section>
      ) : review ? (
        <ReviewDetailCard review={review} />
      ) : null}
    </>
  );
}

function ReviewDetailCard({ review }: { review: Review }) {
  return (
    <section className="panel detail-panel">
      <div className="detail-summary">
        <div className="detail-fact">
          <span>Employee</span>
          <strong>{review.employee_code} · {review.employee_name}</strong>
        </div>
        <div className="detail-fact">
          <span>Review period</span>
          <strong>{review.period_name}</strong>
        </div>
        <div className="detail-rating-summary">
          <span>Overall rating</span>
          <strong>{review.average_rating.toFixed(1)} <small>/ 5</small></strong>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-heading">
          <div>
            <h2>Performance criteria</h2>
            <p>Ratings across the three review criteria</p>
          </div>
          <StatusBadge status={review.status} />
        </div>
        <div className="detail-rating-table">
          <div className="detail-table-heading">
            <span>Criteria</span>
            <span>Rating</span>
          </div>
          <DetailRating label="Quality of Work" value={review.quality_rating} />
          <DetailRating
            label="Delivery & Ownership"
            value={review.delivery_rating}
          />
          <DetailRating
            label="Teamwork & Collaboration"
            value={review.teamwork_rating}
          />
        </div>
      </div>

      <div className="detail-section comments-section">
        <div className="detail-section-heading">
          <div>
            <h2>Manager comments</h2>
            <p>Submitted {formatDate(review.created_at)}</p>
          </div>
          <Icon name="quote" />
        </div>
        <p className="detail-comments">
          {review.comments || "No comments were provided."}
        </p>
      </div>
    </section>
  );
}

function DetailRating({ label, value }: { label: string; value: number }) {
  return (
    <div className="detail-rating-row">
      <span>{label}</span>
      <span className="detail-stars" aria-label={`${value} out of 5`}>
        {"★".repeat(value)}
        <span>{"★".repeat(5 - value)}</span>
      </span>
      <strong>{value}/5</strong>
    </div>
  );
}

function RatingInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rating-input-row">
      <div className="rating-input-label">
        <strong>{label} <b>*</b></strong>
        <span>{description}</span>
      </div>
      <div className="rating-buttons" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            aria-label={`${rating} out of 5`}
            aria-pressed={value === rating}
            className={`rating-button${rating <= value ? " rating-selected" : ""}`}
            onClick={() => onChange(rating)}
          >
            ★
          </button>
        ))}
      </div>
      <span className="rating-value">{value ? `${value}/5` : "Choose"}</span>
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <div className="pagination">
      <span>
        Showing <strong>{first}–{last}</strong> of <strong>{total}</strong> reviews
      </span>
      <div className="pagination-controls" aria-label="Review list pages">
        <button
          aria-label="Previous page"
          className="page-arrow"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        {pages.map((number) => (
          <button
            key={number}
            aria-current={number === page ? "page" : undefined}
            className={`page-number${number === page ? " page-number-active" : ""}`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        <button
          aria-label="Next page"
          className="page-arrow"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <section className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action ?? (
        <button
          className="button button-primary"
          onClick={() => navigate("/submit-review")}
        >
          <Icon name="plus" /> New review
        </button>
      )}
    </section>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none">
        <path
          d="M22 5c-8 4.4-12 10-12 17 0 8.4 5 14 12 17 7-3 12-8.6 12-17C34 15 30 9.4 22 5Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M22 8v28M22 17l-7-6M22 24l8-7M22 30l-7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    people: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.2a3.5 3.5 0 0 1 0 6.6M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
    star: <path d="m12 3 2.75 5.58 6.16.9-4.45 4.34 1.05 6.13L12 17.06l-5.51 2.9 1.05-6.14L3.1 9.48l6.16-.9L12 3Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    document: <><path d="M14 2.75H7A2.25 2.25 0 0 0 4.75 5v14A2.25 2.25 0 0 0 7 21.25h10A2.25 2.25 0 0 0 19.25 19V8z" /><path d="M14 2.75V8h5.25M8.5 12h7M8.5 16h7" /></>,
    eye: <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    alert: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    "arrow-left": <path d="M19 12H5m6 6-6-6 6-6" />,
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
    quote: <><path d="M3 21c3 0 5-2 5-5V9H2v7h3" /><path d="M15 21c3 0 5-2 5-5V9h-6v7h3" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Icon name="document" /></span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function LoadingInline({ label }: { label: string }) {
  return (
    <div className="inline-loading">
      <span className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "DUPLICATE_REVIEW") {
      return "A review already exists for this employee and period.";
    }
    if (error.code === "REVIEW_PERIOD_CLOSED") {
      return "This review period is closed. Choose an open period.";
    }
    return error.message;
  }
  if (error instanceof TypeError) {
    return "Unable to reach the API. Check that the backend is running at http://localhost:8000.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function avatarTone(id: number): string {
  return `avatar-tone-${(id % 5) + 1}`;
}

function formatMonth(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short" })
    .format(date)
    .toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ratingLabel(value: number): string {
  switch (value) {
    case 5:
      return "Excellent";
    case 4:
      return "Strong";
    case 3:
      return "Meets expectations";
    case 2:
      return "Developing";
    default:
      return "Needs improvement";
  }
}

export default App;
