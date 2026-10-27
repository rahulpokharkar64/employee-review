import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReview, getReview } from "../api";
import type { Employee, Review, ReviewCreate, ReviewPeriod } from "../types";
import { EmptyState, Icon, LoadingInline, PageHeading, Pagination, RatingInput, ReviewTable, StatusBadge } from "./shared";
import { formatDate, getErrorMessage, ratingLabel } from "./utils";

type RatingField = "quality_rating" | "delivery_rating" | "teamwork_rating";
const PAGE_SIZE = 5;

export function SubmitReviewPage({
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
                <strong>Server-calculated</strong>
                <span className="preview-note">
                  Returned after submission and shown in the review register.
                </span>
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

export function ReviewListPage({
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

export function ReviewDetailsPage() {
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
          <strong>{review.average_rating.toFixed(2)} <small>/ 5</small></strong>
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
