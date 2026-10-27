import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Review } from "../types";
import { avatarTone, initials } from "./utils";

export function StatCard({
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

export function ReviewTable({
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
                  {review.average_rating.toFixed(2)}
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

export function RatingInput({
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

export function Pagination({
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

export function PageHeading({
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

export function BrandMark() {
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

export function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    people: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.2a3.5 3.5 0 0 1 0 6.6M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
    star: <path d="m12 3 2.75 5.58 6.16.9-4.45 4.34 1.05 6.13L12 17.06l-5.51 2.9 1.05-6.14L3.1 9.48l6.16-.9L12 3Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    document: <><path d="M14 2.75H7A2.25 2.25 0 0 0 4.75 5v14A2.25 2.25 0 0 0 7 21.25h10A2.25 2.25 0 0 0 19.25 19V8z" /><path d="M14 2.75V8h5.25M8.5 12h7M8.5 16h7" /></>,
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

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}

export function EmptyState({
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

export function LoadingInline({ label }: { label: string }) {
  return (
    <div className="inline-loading">
      <span className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}
