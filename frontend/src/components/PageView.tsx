import type { MenuKey } from '../types'
import DashboardPage from './DashboardPage'
import EmployeesPage from './EmployeesPage'
import MyReviewsPage from './MyReviewsPage'
import ReviewsPage from './ReviewsPage'
import SubmitReviewPage from './SubmitReviewPage'

// Picks the screen for the selected sidebar menu item.
export default function PageView({ active }: { active: MenuKey }) {
  switch (active) {
    case 'my-reviews':
      return <MyReviewsPage />
    case 'submit-review':
      return <SubmitReviewPage />
    case 'reviews':
      return <ReviewsPage />
    case 'employees':
      return <EmployeesPage />
    default:
      return <DashboardPage />
  }
}
