interface Props {
  page: number
  total: number
  pageSize: number
  noun?: string // "reviews", "employees"
  onChange: (page: number) => void
}

export default function Pagination({ page, total, pageSize, noun = 'items', onChange }: Props) {
  if (total === 0) return null
  const pages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  // Show at most 5 page buttons, centred on the current page.
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i)

  return (
    <div className="pagination">
      <span className="muted">
        Showing {from} to {to} of {total} {noun}
      </span>
      <div className="page-buttons">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">‹</button>
        {numbers.map((n) => (
          <button key={n} className={n === page ? 'current' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>
            {n}
          </button>
        ))}
        <button disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page">›</button>
      </div>
    </div>
  )
}
