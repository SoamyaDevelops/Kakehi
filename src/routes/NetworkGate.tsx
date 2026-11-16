import { Outlet } from 'react-router-dom'
import { useNetwork } from '../context/NetworkContext'
import { FullScreenLoader } from '../components/ui/Feedback'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Feedback'
import { WifiOff } from 'lucide-react'
import NetworkBlockedPage from '../pages/NetworkBlockedPage'

/** Shows the app only when the server says this connection is on the trusted network. */
export function NetworkGate() {
  const { state, recheck } = useNetwork()

  if (state.phase === 'checking') return <FullScreenLoader />

  if (state.phase === 'error') {
    return (
      <div className="center-screen">
        <EmptyState
          icon={<WifiOff size={28} aria-hidden />}
          title="Can’t reach Kakehi"
          action={<Button onClick={() => void recheck()}>Try again</Button>}
        >
          Check your internet connection. If it keeps happening, the service may be down.
        </EmptyState>
      </div>
    )
  }

  if (!state.status.trusted) return <NetworkBlockedPage />
  return <Outlet />
}
