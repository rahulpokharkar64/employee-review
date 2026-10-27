import type { Employee, Review } from '../types'
import { average, oneDecimal } from '../utils'
import StarRating from './StarRating'

interface Props {
  employee: Employee
  reviews: Review[] // all reviews of this employee, newest first
}

export default function EmployeeRow({ employee, reviews }: Props) {
  const avg = average(reviews.map((r) => r.average_rating))
  return (
    <tr>
      <td>{employee.employee_id}</td>
      <td>{employee.name}</td>
      <td>{employee.department ?? '-'}</td>
      <td>
        {reviews.length ? (
          <span className="rating-cell"><StarRating value={avg} /> {oneDecimal(avg)}</span>
        ) : (
          <span className="muted">Not reviewed</span>
        )}
      </td>
      <td className="comment-cell">{reviews[0]?.comments || <span className="muted">-</span>}</td>
    </tr>
  )
}
