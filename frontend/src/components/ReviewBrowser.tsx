import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PAGE_SIZE } from '../config'
import type { Review } from '../types'
import Pagination from './Pagination'
import ReviewDetails from './ReviewDetails'
import ReviewTable from './ReviewTable'
import StatusMessage from './StatusMessage'

interface Props {
  reviews: Review[]
  loading: boolean
  error: string
  onRetry: () => void
  toolbar: ReactNode // filters shown above the table
  emptyText?: string
}

// Shared by Reviews and My Reviews: table + pagination, and switches to Review Details on "View".
export default function ReviewBrowser({ reviews, loading, error, onRetry, toolbar, emptyText }: Props) {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => setPage(1), [reviews])

  if (selectedId !== null) return <ReviewDetails reviewId={selectedId} onBack={() => setSelectedId(null)} />

  const visible = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <>
      {toolbar}
      <StatusMessage loading={loading} error={error} empty={!loading && !error && reviews.length === 0} emptyText={emptyText} onRetry={onRetry} />
      {!loading && !error && reviews.length > 0 && (
        <>
          <ReviewTable reviews={visible} onView={setSelectedId} />
          <Pagination page={page} total={reviews.length} pageSize={PAGE_SIZE} noun="reviews" onChange={setPage} />
        </>
      )}
    </>
  )
}
