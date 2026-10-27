import emptyImage from '../assets/empty-reviews.svg'

interface Props {
  loading: boolean
  error: string
  empty: boolean
  emptyText?: string
  onRetry?: () => void
}

// Shows loading / error / empty state. Returns null when there is data to display.
export default function StatusMessage({ loading, error, empty, emptyText = 'No records found.', onRetry }: Props) {
  if (loading) return <div className="status-box">Loading…</div>
  if (error)
    return (
      <div className="status-box error" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button className="btn btn-outline" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  if (empty)
    return (
      <div className="status-box">
        <img src={emptyImage} alt="" width={96} />
        <p>{emptyText}</p>
      </div>
    )
  return null
}
