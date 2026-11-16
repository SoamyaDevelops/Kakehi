import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { LogoMark } from '../components/ui/Logo'
import { TextField, PasswordField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'
import { friendlyAuthError } from '../services/auth'
import { normalizeUsername } from '../lib/validation'

export default function LoginPage() {
  const { signIn } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signIn(normalizeUsername(username), password)
      // PublicOnly redirects once the session is set.
    } catch (err) {
      setError(friendlyAuthError(err))
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <header>
        <div className="logo-large"><LogoMark size={44} animate /></div>
        <h1>Sign in to Kakehi</h1>
        <p className="muted">Use the username and password you registered with.</p>
      </header>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {error && <Notice kind="error">{error}</Notice>}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <Button type="submit" variant="primary" block loading={busy}>Sign in</Button>
      </form>
      <p className="auth-alt">
        New here? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}
