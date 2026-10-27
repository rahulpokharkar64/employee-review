import { useState } from 'react'
import { getEmployees, getReviews } from '../api'
import { useApi } from '../hooks'
import Header from './Header'
import EmployeePicker from './EmployeePicker'
import ReviewBrowser from './ReviewBrowser'

const STORAGE_KEY = 'myEmployeeCode'

function loadCode(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

// Reviews that belong to the employee chosen in "I am" (remembered in the browser).
export default function MyReviewsPage() {
  const [code, setCode] = useState(loadCode)
  const employees = useApi(() => getEmployees('Active'))
  const reviews = useApi(
    () => (code ? getReviews({ employee_code: code, period_id: '' }) : Promise.resolve([])),
    [code],
  )

  function choose(next: string) {
    setCode(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable: selection just won't be remembered */
    }
  }

  return (
    <section className="panel">
      <Header title="My Reviews" />
      <div className="panel-body">
        <ReviewBrowser
          reviews={reviews.data ?? []}
          loading={reviews.loading}
          error={reviews.error || employees.error}
          onRetry={() => { reviews.reload(); employees.reload() }}
          emptyText={code ? 'No reviews found for this employee yet.' : 'Select who you are to see your reviews.'}
          toolbar={<EmployeePicker employees={employees.data ?? []} value={code} onChange={choose} />}
        />
      </div>
    </section>
  )
}
