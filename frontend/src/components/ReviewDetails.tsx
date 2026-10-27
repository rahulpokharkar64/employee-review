import { getReview } from '../api'
import { useApi } from '../hooks'
import { RATING_CRITERIA } from '../types'
import { oneDecimal } from '../utils'
import Header from './Header'
import StarRating from './StarRating'
import StatusMessage from './StatusMessage'

interface Props {
  reviewId: number
  onBack: () => void
}

// Optional screen 3: loads one review with GET /reviews/{id}.
export default function ReviewDetails({ reviewId, onBack }: Props) {
  const { data: review, loading, error, reload } = useApi(() => getReview(reviewId), [reviewId])

  return (
    <section className="panel">
      <Header title="Review Details">
        <button className="btn btn-outline" onClick={onBack}>Back to List</button>
      </Header>
      <div className="panel-body">
        <StatusMessage loading={loading} error={error} empty={false} onRetry={reload} />
        {review && (
          <>
            <div className="summary-strip">
              <div>
                <h3>Employee</h3>
                <p>{review.employee_code} - {review.employee_name}</p>
              </div>
              <div>
                <h3>Review Period</h3>
                <p>{review.period_name}</p>
              </div>
              <div>
                <h3>Overall Rating</h3>
                <p className="overall"><strong>{oneDecimal(review.average_rating)}</strong> / 5</p>
              </div>
            </div>

            <h2 className="section-title">Performance Criteria</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Criteria</th><th>Rating</th></tr></thead>
                <tbody>
                  {RATING_CRITERIA.map((c) => (
                    <tr key={c.key}>
                      <td>{c.label}</td>
                      <td><StarRating value={review[c.key]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="section-title">Manager Comments</h2>
            <p className="comment-box">{review.comments || 'No comments were added.'}</p>
          </>
        )}
      </div>
    </section>
  )
}
