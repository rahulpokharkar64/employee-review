import type { AlertMessage } from '../types'

interface Props {
  alert: AlertMessage | null
  onClose?: () => void
}

export default function Alert({ alert, onClose }: Props) {
  if (!alert) return null
  return (
    <div className={`alert ${alert.kind}`} role={alert.kind === 'error' ? 'alert' : 'status'}>
      <span>{alert.text}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}
