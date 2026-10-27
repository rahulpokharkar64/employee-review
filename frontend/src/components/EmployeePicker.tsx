import type { Employee } from '../types'
import { formatEmployee } from '../utils'

interface Props {
  employees: Employee[]
  value: string // employee code, '' = nobody chosen
  onChange: (code: string) => void
}

// "Who am I?" selector for My Reviews (the backend has no login).
export default function EmployeePicker({ employees, value, onChange }: Props) {
  return (
    <div className="filters">
      <label className="field">
        <span>I am</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select employee</option>
          {employees.map((e) => <option key={e.id} value={e.employee_id}>{formatEmployee(e)}</option>)}
        </select>
      </label>
    </div>
  )
}
