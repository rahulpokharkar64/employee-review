import type { Review } from '../types'
import ReviewRow from './ReviewRow'

interface Props {
  reviews: Review[]
  onView?: (id: number) => void
}

export default function ReviewTable({ reviews, onView }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Period</th>
            <th>Ratings</th>
            <th>Average</th>
            <th>Status</th>
            {onView && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} onView={onView} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
