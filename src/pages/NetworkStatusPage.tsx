import { Link } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { Notice, Spinner } from '../components/ui/Feedback'
import { useNetwork } from '../context/NetworkContext'

/** Public diagnostic page. Reveals only booleans, never IPs or ranges. */
export default function NetworkStatusPage() {
  const { state, recheck } = useNetwork()

  return (
    <AuthLayout>
      <header>
        <h1>Connection check</h1>
        <p className="muted">What Kakehi’s server sees about this connection.</p>
      </header>

      {state.phase === 'checking' && <Spinner />}
      {state.phase === 'error' && <Notice kind="error">Couldn’t reach the server. Check your internet connection.</Notice>}

      {state.phase === 'ready' && (
        <div>
          <div className="status-row">
            <span>Network restriction</span>
            <span className={`pill ${state.status.enforcement_active ? 'pill-ok' : 'pill-warn'}`}>
              {state.status.enforcement_active ? 'Active' : 'Not active yet'}
            </span>
          </div>
          <div className="status-row">
            <span>This connection</span>
            <span className={`pill ${state.status.trusted ? 'pill-ok' : 'pill-bad'}`}>
              {state.status.trusted ? 'Allowed' : 'Not on the college network'}
            </span>
          </div>
        </div>
      )}

      {state.phase === 'ready' && !state.status.enforcement_active && (
        <Notice kind="warning" title="Anyone with the link can get in right now">
          The college network restriction is set up but switched off until it has been tested on the college Wi-Fi.
        </Notice>
      )}

      <div className="form-actions">
        <Button onClick={() => void recheck()}>Check again</Button>
        <Link to="/" className="btn btn-ghost">Back to Kakehi</Link>
      </div>
    </AuthLayout>
  )
}
