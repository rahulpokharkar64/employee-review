// ---- API models (match backend/models.py) ----

export interface Employee {
  id: number // numeric database key, used when submitting a review
  employee_id: string // displayed code, e.g. EMP101
  name: string
  department: string | null
  email: string | null
  status: string
}

export interface ReviewPeriod {
  id: number
  name: string
  start_date: string
  end_date: string
  status: 'Open' | 'Closed'
}

export interface Review {
  id: number
  employee_id: number
  employee_code: string
  employee_name: string
  period_id: number
  period_name: string
  quality_rating: number
  delivery_rating: number
  teamwork_rating: number
  average_rating: number
  comments: string
  status: 'Completed'
  created_at: string
}

// Body sent to POST /reviews
export interface ReviewCreate {
  employee_id: number
  period_id: number
  quality_rating: number
  delivery_rating: number
  teamwork_rating: number
  comments: string
}

// ---- UI state ----

export type MenuKey = 'dashboard' | 'my-reviews' | 'submit-review' | 'reviews' | 'employees'

export interface MenuItem {
  key: MenuKey
  label: string
}

export type RatingKey = 'quality_rating' | 'delivery_rating' | 'teamwork_rating'

export interface RatingCriterion {
  key: RatingKey
  label: string
}

// Form values: selects hold strings ('' = nothing chosen), ratings 0 = not rated yet
export interface ReviewFormValues {
  employee_id: string
  period_id: string
  quality_rating: number
  delivery_rating: number
  teamwork_rating: number
  comments: string
}

export interface ReviewFilters {
  period_id: string // '' = All Periods
  employee_code: string // '' = All Employees
}

export type AlertKind = 'success' | 'error'

export interface AlertMessage {
  kind: AlertKind
  text: string
}

// ---- Defaults ----

export const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'my-reviews', label: 'My Reviews' },
  { key: 'submit-review', label: 'Submit Review' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'employees', label: 'Employees' },
]

export const RATING_CRITERIA: RatingCriterion[] = [
  { key: 'quality_rating', label: 'Quality of Work' },
  { key: 'delivery_rating', label: 'Delivery & Ownership' },
  { key: 'teamwork_rating', label: 'Teamwork & Collaboration' },
]

export const MAX_RATING = 5

export const DEFAULT_REVIEW_FORM: ReviewFormValues = {
  employee_id: '',
  period_id: '',
  quality_rating: 0,
  delivery_rating: 0,
  teamwork_rating: 0,
  comments: '',
}

export const DEFAULT_FILTERS: ReviewFilters = {
  period_id: '',
  employee_code: '',
}

export const DEFAULT_EMPLOYEE: Employee = {
  id: 0,
  employee_id: '',
  name: '',
  department: null,
  email: null,
  status: 'Active',
}

export const DEFAULT_REVIEW: Review = {
  id: 0,
  employee_id: 0,
  employee_code: '',
  employee_name: '',
  period_id: 0,
  period_name: '',
  quality_rating: 0,
  delivery_rating: 0,
  teamwork_rating: 0,
  average_rating: 0,
  comments: '',
  status: 'Completed',
  created_at: '',
}
