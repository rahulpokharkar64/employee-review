import { API_BASE_URL, ENDPOINTS } from './config'
import type { Employee, Review, ReviewCreate, ReviewFilters, ReviewPeriod } from './types'

export class ApiRequestError extends Error {
  status: number
  code?: string
  constructor(message: string, status = 0, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

// Turns the backend error bodies ({code,message} or FastAPI's {detail:[...]}) into one readable message.
function readError(body: any, status: number): ApiRequestError {
  if (body?.message) return new ApiRequestError(body.message, status, body.code)
  if (Array.isArray(body?.detail)) {
    const text = body.detail.map((d: any) => `${(d.loc ?? []).slice(1).join('.')}: ${d.msg}`).join('; ')
    return new ApiRequestError(text, status, 'VALIDATION_ERROR')
  }
  return new ApiRequestError(`Request failed (HTTP ${status}).`, status)
}

async function request<T>(path: string, init?: RequestInit, params?: Record<string, string>): Promise<T> {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([k, v]) => v && query.set(k, v))
  const qs = query.toString()
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new ApiRequestError(`Cannot reach the API at ${API_BASE_URL}. Is the backend running?`)
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) throw readError(body, response.status)
  return body as T
}

export const getEmployees = (status?: 'Active' | 'Inactive') =>
  request<Employee[]>(ENDPOINTS.employees, undefined, { status: status ?? '' })

export const getReviewPeriods = (status?: 'Open' | 'Closed') =>
  request<ReviewPeriod[]>(ENDPOINTS.reviewPeriods, undefined, { status: status ?? '' })

// employee_code is the code (EMP101); the backend names this query parameter employee_id.
export const getReviews = (filters: ReviewFilters) =>
  request<Review[]>(ENDPOINTS.reviews, undefined, {
    employee_id: filters.employee_code,
    period_id: filters.period_id,
  })

export const getReview = (id: number) => request<Review>(ENDPOINTS.review(id))

export const createReview = (payload: ReviewCreate) =>
  request<Review>(ENDPOINTS.reviews, { method: 'POST', body: JSON.stringify(payload) })
