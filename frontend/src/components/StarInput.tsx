import { MAX_RATING } from '../types'
import { Star } from './StarRating'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
}

// Clickable 1-5 stars for the review form (keyboard accessible: each star is a button).
export default function StarInput({ label, value, onChange }: Props) {
  return (
    <div className="rating-row">
      <span className="rating-label">
        {label} <span className="required">*</span>
      </span>
      <div className="stars-input" role="radiogroup" aria-label={label}>
        {Array.from({ length: MAX_RATING }, (_, i) => (
          <button
            type="button"
            key={i}
            role="radio"
            aria-checked={value === i + 1}
            aria-label={`${i + 1} star${i ? 's' : ''}`}
            onClick={() => onChange(i + 1)}
          >
            <Star filled={i < value} />
          </button>
        ))}
      </div>
    </div>
  )
}
