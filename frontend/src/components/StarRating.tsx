import { MAX_RATING } from '../types'

interface Props {
  value: number // 0-5, fractions are rounded to the nearest star
}

export function Star({ filled }: { filled: boolean }) {
  return (
    <svg className={`star${filled ? ' filled' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
    </svg>
  )
}

// Read-only stars: filled gold up to the rating, grey after.
export default function StarRating({ value }: Props) {
  const rounded = Math.round(value)
  return (
    <span className="stars" role="img" aria-label={`${value} out of ${MAX_RATING}`}>
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <Star key={i} filled={i < rounded} />
      ))}
    </span>
  )
}
