import { getEmployees, getReviewPeriods, getReviews } from '../api'
import { useApi } from '../hooks'
import { DEFAULT_FILTERS } from '../types'
import Header from './Header'
import RatingChart from './RatingChart'
import ReviewTable from './ReviewTable'
import StatusMessage from './StatusMessage'
import SummaryCards from './SummaryCards'

const RECENT_COUNT = 5

export default function DashboardPage() {
  const reviews = useApi(() => getReviews(DEFAULT_FILTERS))
  const employees = useApi(() => getEmployees())
  const periods = useApi(() => getReviewPeriods())

  const loading = reviews.loading || employees.loading || periods.loading
  const error = reviews.error || employees.error || periods.error
  const retry = () => { reviews.reload(); employees.reload(); periods.reload() }

  const ready = !loading && !error
  const allReviews = reviews.data ?? []

  return (
    <div className="stack">
      <section className="panel">
        <Header title="Dashboard" />
        <div className="panel-body">
          <StatusMessage loading={loading} error={error} empty={false} onRetry={retry} />
          {ready && <SummaryCards reviews={allReviews} employees={employees.data ?? []} periods={periods.data ?? []} />}
        </div>
      </section>

      {ready && (
        <>
          <section className="panel">
            <Header title="Rating Distribution" />
            <div className="panel-body"><RatingChart reviews={allReviews} /></div>
          </section>
          <section className="panel">
            <Header title="Recent Reviews" />
            <div className="panel-body">
              {allReviews.length === 0
                ? <StatusMessage loading={false} error="" empty emptyText="No reviews have been submitted yet." />
                : <ReviewTable reviews={allReviews.slice(0, RECENT_COUNT)} />}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
