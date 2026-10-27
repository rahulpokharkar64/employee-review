// Single place that reads the .env values. Nothing else in the app touches import.meta.env.
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')
export const PAGE_SIZE: number = Number(import.meta.env.VITE_PAGE_SIZE) || 5
export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'Testleaf'

// Endpoint paths (relative to API_BASE_URL) as defined by the backend.
export const ENDPOINTS = {
  employees: '/employees',
  reviewPeriods: '/review-periods',
  reviews: '/reviews',
  review: (id: number) => `/reviews/${id}`,
}
