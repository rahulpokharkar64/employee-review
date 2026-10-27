import { useEffect, useMemo, useState } from 'react'
import { getEmployees, getReviews } from '../api'
import { PAGE_SIZE } from '../config'
import { useApi } from '../hooks'
import { DEFAULT_FILTERS } from '../types'
import type { Review } from '../types'
import EmployeeSearch from './EmployeeSearch'
import EmployeeTable from './EmployeeTable'
import Header from './Header'
import Pagination from './Pagination'
import StatusMessage from './StatusMessage'

export default function EmployeesPage() {
  const employees = useApi(() => getEmployees())
  const reviews = useApi(() => getReviews(DEFAULT_FILTERS))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => setPage(1), [search])

  // Group reviews by employee code so each row can show its rating and latest comment.
  const reviewsByCode = useMemo(() => {
    const map = new Map<string, Review[]>()
    ;(reviews.data ?? []).forEach((r) => map.set(r.employee_code, [...(map.get(r.employee_code) ?? []), r]))
    return map
  }, [reviews.data])

  const term = search.trim().toLowerCase()
  const filtered = (employees.data ?? []).filter(
    (e) => !term || e.employee_id.toLowerCase().includes(term) || e.name.toLowerCase().includes(term),
  )
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loading = employees.loading || reviews.loading
  const error = employees.error || reviews.error

  return (
    <section className="panel">
      <Header title="Employees" />
      <div className="panel-body">
        <EmployeeSearch value={search} onChange={setSearch} />
        <StatusMessage
          loading={loading}
          error={error}
          empty={!loading && !error && filtered.length === 0}
          emptyText="No employees match your search."
          onRetry={() => { employees.reload(); reviews.reload() }}
        />
        {!loading && !error && filtered.length > 0 && (
          <>
            <EmployeeTable employees={visible} reviewsByCode={reviewsByCode} />
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} noun="employees" onChange={setPage} />
          </>
        )}
      </div>
    </section>
  )
}
