import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenLoader, EmptyState } from '../components/ui/Feedback'
import { Button } from '../components/ui/Button'
import { AlertCircle, ShieldAlert } from 'lucide-react'

interface FromState { from?: string }

/** Requires a signed-in user with a loaded, active profile. Preserves the intended destination. */
export function RequireAuth() {
  const { initializing, session, profile, profileLoading, signOut, refreshProfile } = useAuth()
  const location = useLocation()

  if (initializing) return <FullScreenLoader />
  if (!session) {
    const from = location.pathname + location.search + location.hash
    return <Navigate to="/login" replace state={{ from } satisfies FromState} />
  }
  if (profileLoading) return <FullScreenLoader />

  if (!profile) {
    return (
      <div className="center-screen">
        <EmptyState
          icon={<AlertCircle size={28} aria-hidden />}
          title="Couldn’t load your profile"
          action={
            <div className="form-actions">
              <Button variant="primary" onClick={() => void refreshProfile()}>Try again</Button>
              <Button onClick={() => void signOut()}>Sign out</Button>
            </div>
          }
        >
          Check your connection and try again.
        </EmptyState>
      </div>
    )
  }

  if (profile.status !== 'active') {
    return (
      <div className="center-screen">
        <EmptyState
          icon={<ShieldAlert size={28} aria-hidden />}
          title={profile.status === 'suspended' ? 'Your account is suspended' : 'Your account is deactivated'}
          action={<Button onClick={() => void signOut()}>Sign out</Button>}
        >
          Contact the Kakehi owner if you think this is a mistake.
        </EmptyState>
      </div>
    )
  }

  return <Outlet />
}

/** Login/register: signed-in users go straight to where they were headed. */
export function PublicOnly() {
  const { initializing, session } = useAuth()
  const location = useLocation()
  if (initializing) return <FullScreenLoader />
  if (session) {
    const from = (location.state as FromState | null)?.from
    return <Navigate to={from && from.startsWith('/app') ? from : '/app/home'} replace />
  }
  return <Outlet />
}

export function RootRedirect() {
  const { initializing, session } = useAuth()
  if (initializing) return <FullScreenLoader />
  return <Navigate to={session ? '/app/home' : '/login'} replace />
}
