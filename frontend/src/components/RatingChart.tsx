import { MAX_RATING } from '../types'
import type { Review } from '../types'

// Counts reviews by their rounded average (1-5 stars) and draws one bar per star level.
export default function RatingChart({ reviews }: { reviews: Review[] }) {
  const levels = Array.from({ length: MAX_RATING }, (_, i) => MAX_RATING - i)
  const counts = levels.map((star) => reviews.filter((r) => Math.round(r.average_rating) === star).length)
  const max = Math.max(1, ...counts)

  return (
    <div className="chart" role="img" aria-label="Number of reviews for each average star rating">
      {levels.map((star, i) => (
        <div className="chart-row" key={star}>
          <span className="chart-label">{star} {star === 1 ? 'star' : 'stars'}</span>
          <div className="chart-track">
            <div className="chart-bar" style={{ width: `${(counts[i] / max) * 100}%` }} />
          </div>
          <span className="chart-count">{counts[i]}</span>
        </div>
      ))}
    </div>
  )
}
