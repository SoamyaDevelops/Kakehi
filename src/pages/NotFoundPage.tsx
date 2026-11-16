import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/ui/Feedback'

export default function NotFoundPage() {
  return (
    <div className="center-screen">
      <EmptyState
        icon={<Compass size={28} aria-hidden />}
        title="Page not found"
        action={<Link to="/" className="btn btn-primary">Go to Kakehi</Link>}
      >
        The link may be mistyped, or the page was moved.
      </EmptyState>
    </div>
  )
}
