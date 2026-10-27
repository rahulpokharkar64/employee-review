import type { Employee, ReviewFilters as Filters, ReviewPeriod } from '../types'
import { formatEmployee } from '../utils'
import Icon from './Icon'

interface Props {
  periods: ReviewPeriod[]
  employees: Employee[]
  value: Filters
  onChange: (value: Filters) => void
  onSearch: () => void
}

// Review period + employee filters with a Search button (Reviews screen).
export default function ReviewFilters({ periods, employees, value, onChange, onSearch }: Props) {
  return (
    <form className="filters" onSubmit={(e) => { e.preventDefault(); onSearch() }}>
      <label className="field">
        <span>Review Period</span>
        <select value={value.period_id} onChange={(e) => onChange({ ...value, period_id: e.target.value })}>
          <option value="">All Periods</option>
          {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Employee</span>
        <select value={value.employee_code} onChange={(e) => onChange({ ...value, employee_code: e.target.value })}>
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e.id} value={e.employee_id}>{formatEmployee(e)}</option>)}
        </select>
      </label>
      <button type="submit" className="btn btn-primary"><Icon name="search" /> Search</button>
    </form>
  )
}
