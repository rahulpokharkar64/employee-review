import type { Employee, Review } from '../types'
import EmployeeRow from './EmployeeRow'

interface Props {
  employees: Employee[]
  reviewsByCode: Map<string, Review[]>
}

export default function EmployeeTable({ employees, reviewsByCode }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Rating</th>
            <th>Latest Comments</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <EmployeeRow key={e.id} employee={e} reviews={reviewsByCode.get(e.employee_id) ?? []} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
