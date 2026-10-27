import { useState } from 'react'
import type { FormEvent } from 'react'
import { createReview, getEmployees, getReviewPeriods } from '../api'
import { useApi } from '../hooks'
import { DEFAULT_REVIEW_FORM, RATING_CRITERIA } from '../types'
import type { AlertMessage, ReviewFormValues } from '../types'
import { formatEmployee, formatPeriod, oneDecimal } from '../utils'
import Alert from './Alert'
import StarInput from './StarInput'

// Screen 1: Submit Performance Review (POST /reviews).
export default function ReviewForm() {
  const employees = useApi(() => getEmployees('Active'))
  const periods = useApi(() => getReviewPeriods('Open'))
  const [form, setForm] = useState<ReviewFormValues>(DEFAULT_REVIEW_FORM)
  const [alert, setAlert] = useState<AlertMessage | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => setForm((f) => ({ ...f, [key]: value }))

  function validate(): string {
    if (!form.employee_id) return 'Select an employee.'
    if (!form.period_id) return 'Select a review period.'
    if (RATING_CRITERIA.some((c) => form[c.key] < 1)) return 'Give every performance criterion a rating from 1 to 5.'
    if (!form.comments.trim()) return 'Enter your overall comments.'
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = validate()
    if (problem) return setAlert({ kind: 'error', text: problem })
    setSaving(true)
    try {
      const saved = await createReview({
        employee_id: Number(form.employee_id),
        period_id: Number(form.period_id),
        quality_rating: form.quality_rating,
        delivery_rating: form.delivery_rating,
        teamwork_rating: form.teamwork_rating,
        comments: form.comments.trim(),
      })
      setAlert({ kind: 'success', text: `Review saved for ${saved.employee_name} (${saved.period_name}). Average rating: ${oneDecimal(saved.average_rating)}.` })
      setForm(DEFAULT_REVIEW_FORM)
    } catch (err) {
      setAlert({ kind: 'error', text: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setForm(DEFAULT_REVIEW_FORM)
    setAlert(null)
  }

  const loadError = employees.error || periods.error

  return (
    <form className="panel-body review-form" onSubmit={handleSubmit} noValidate>
      <Alert alert={alert} onClose={() => setAlert(null)} />
      <Alert alert={loadError ? { kind: 'error', text: loadError } : null} />

      <div className="form-grid">
        <label className="field">
          <span>Employee <span className="required">*</span></span>
          <select value={form.employee_id} onChange={(e) => set('employee_id', e.target.value)}>
            <option value="">Select employee</option>
            {(employees.data ?? []).map((emp) => <option key={emp.id} value={emp.id}>{formatEmployee(emp)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Review Period <span className="required">*</span></span>
          <select value={form.period_id} onChange={(e) => set('period_id', e.target.value)}>
            <option value="">Select period</option>
            {(periods.data ?? []).map((p) => <option key={p.id} value={p.id}>{formatPeriod(p)}</option>)}
          </select>
        </label>
      </div>

      <h2 className="section-title">Performance Ratings (1 - 5)</h2>
      {RATING_CRITERIA.map((c) => (
        <StarInput key={c.key} label={c.label} value={form[c.key]} onChange={(v) => set(c.key, v)} />
      ))}

      <label className="field comments">
        <span className="section-title">Overall Comments <span className="required">*</span></span>
        <textarea
          rows={5}
          maxLength={2000}
          placeholder="Enter your feedback, strengths, areas of improvement..."
          value={form.comments}
          onChange={(e) => set('comments', e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit Review'}</button>
      </div>
    </form>
  )
}
