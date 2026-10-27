import { useState } from 'react'
import { getEmployees, getReviewPeriods, getReviews } from '../api'
import { useApi } from '../hooks'
import { DEFAULT_FILTERS } from '../types'
import Header from './Header'
import ReviewBrowser from './ReviewBrowser'
import ReviewFilters from './ReviewFilters'

// Screen 2: Performance Reviews list, filtered by period and employee ID.
export default function ReviewsPage() {
  const [draft, setDraft] = useState(DEFAULT_FILTERS) // what the dropdowns show
  const [applied, setApplied] = useState(DEFAULT_FILTERS) // what was searched
  const periods = useApi(() => getReviewPeriods())
  const employees = useApi(() => getEmployees())
  const reviews = useApi(() => getReviews(applied), [applied])

  return (
    <section className="panel">
      <Header title="Performance Reviews" />
      <div className="panel-body">
        <ReviewBrowser
          reviews={reviews.data ?? []}
          loading={reviews.loading}
          error={reviews.error}
          onRetry={reviews.reload}
          emptyText="No reviews match these filters."
          toolbar={
            <ReviewFilters
              periods={periods.data ?? []}
              employees={employees.data ?? []}
              value={draft}
              onChange={setDraft}
              onSearch={() => setApplied(draft)}
            />
          }
        />
      </div>
    </section>
  )
}
