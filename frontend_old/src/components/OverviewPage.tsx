import type { Employee, Review, ReviewPeriod } from "../types";
import { EmptyState, Icon, LoadingInline, ReviewTable, StatCard, StatusBadge } from "./shared";
import { formatDate, formatMonth } from "./utils";

export function OverviewPage({
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
