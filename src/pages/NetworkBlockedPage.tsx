import { Link } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { useNetwork } from '../context/NetworkContext'
import { useState } from 'react'

export default function NetworkBlockedPage() {
  const { recheck } = useNetwork()
  const [busy, setBusy] = useState(false)

  async function retry() {
    setBusy(true)
    await recheck()
    setBusy(false)
  }

  return (
    <AuthLayout>
      <header>
        <div className="logo-large muted"><WifiOff size={36} aria-hidden /></div>
        <h1>Kakehi isn’t available on this network</h1>
        <p className="muted">
          Kakehi is only open on the college Wi-Fi. Connect to it, turn off any VPN, then try again.
        </p>
      </header>
      <div className="form-actions">
        <Button variant="primary" onClick={retry} loading={busy}>Try again</Button>
        <Link to="/network-status" className="btn btn-secondary">Check connection</Link>
      </div>
    </AuthLayout>
  )
}
