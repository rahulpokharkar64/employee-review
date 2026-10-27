import type { Employee, Review, ReviewPeriod } from './types'

const MONTH = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })

// "H1 2026 (Jan - Jun)"
export function formatPeriod(p: ReviewPeriod): string {
  const start = MONTH.format(new Date(p.start_date))
  const end = MONTH.format(new Date(p.end_date))
  return `${p.name} (${start} - ${end})`
}

// "EMP101 - Alice Smith"
export function formatEmployee(e: Employee): string {
  return `${e.employee_id} - ${e.name}`
}

// "4, 5, 4"
export function ratingsText(r: Review): string {
  return `${r.quality_rating}, ${r.delivery_rating}, ${r.teamwork_rating}`
}

export function oneDecimal(n: number): string {
  return Number(n).toFixed(1)
}

export function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}
