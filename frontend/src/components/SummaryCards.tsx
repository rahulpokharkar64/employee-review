import type { Employee, Review, ReviewPeriod } from '../types'
import { average, oneDecimal } from '../utils'

interface Props {
  reviews: Review[]
  employees: Employee[]
  periods: ReviewPeriod[]
}

export default function SummaryCards({ reviews, employees, periods }: Props) {
  const active = employees.filter((e) => e.status === 'Active')
  const reviewed = new Set(reviews.map((r) => r.employee_id)).size
  const cards = [
    { label: 'Total Reviews', value: String(reviews.length) },
    { label: 'Average Rating', value: `${oneDecimal(average(reviews.map((r) => r.average_rating)))} / 5` },
    { label: 'Employees Reviewed', value: `${reviewed} of ${employees.length}`, note: `${active.length} active` },
    { label: 'Open Periods', value: String(periods.filter((p) => p.status === 'Open').length) },
  ]
  return (
    <div className="cards">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <h3>{c.label}</h3>
          <p className="card-value">{c.value}</p>
          {c.note && <span className="muted">{c.note}</span>}
        </div>
      ))}
    </div>
  )
}
