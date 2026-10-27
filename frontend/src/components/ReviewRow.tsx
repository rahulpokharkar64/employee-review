import type { Review } from '../types'
import { oneDecimal, ratingsText } from '../utils'

interface Props {
  review: Review
  onView?: (id: number) => void // omit to hide the Action link
}

export default function ReviewRow({ review, onView }: Props) {
  return (
    <tr>
      <td>{review.employee_code}</td>
      <td>{review.employee_name}</td>
      <td>{review.period_name}</td>
      <td>{ratingsText(review)}</td>
      <td>{oneDecimal(review.average_rating)}</td>
      <td>
        <span className="badge">{review.status}</span>
      </td>
      {onView && (
        <td>
          <button className="link" onClick={() => onView(review.id)}>View</button>
        </td>
      )}
    </tr>
  )
}
