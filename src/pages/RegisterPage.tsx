import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { TextField, PasswordField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'
import { friendlyAuthError } from '../services/auth'
import { useUsernameAvailability } from '../hooks/useUsernameAvailability'
import { normalizeUsername, validateDisplayName, validatePassword, validateUsername } from '../lib/validation'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ username: false, displayName: false, password: false })
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const availability = useUsernameAvailability(username)

  const usernameFormatError = validateUsername(username)
  const usernameError =
    touched.username && usernameFormatError
      ? usernameFormatError
      : availability === 'taken'
        ? 'That username is taken. Try another.'
        : null
  const displayError = touched.displayName ? validateDisplayName(displayName) : null
  const passwordError = touched.password ? validatePassword(password) : null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ username: true, displayName: true, password: true })
    if (validateUsername(username) || validateDisplayName(displayName) || validatePassword(password) || availability === 'taken') return
    setBusy(true)
    setFormError(null)
    try {
      await signUp({ username: normalizeUsername(username), displayName, password })
    } catch (err) {
      setFormError(friendlyAuthError(err))
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <header>
        <h1>Create your account</h1>
        <p className="muted">Pick a username and you’re in. You can add a photo and bio afterwards.</p>
      </header>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {formError && <Notice kind="error">{formError}</Notice>}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          error={usernameError}
          hint="3–20 letters, numbers or underscores. Friends find you by this."
          status={availability === 'checking' ? 'checking' : availability === 'available' ? 'ok' : undefined}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
          autoFocus
        />
        <TextField
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
          error={displayError}
          hint="The name your classmates see."
          autoComplete="name"
          maxLength={60}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
          hint="At least 8 characters. There’s no email on file, so keep it somewhere safe."
          autoComplete="new-password"
        />
        <Button type="submit" variant="primary" block loading={busy}>Create account</Button>
      </form>
      <p className="auth-alt">
        Already registered? <Link to="/login" state={location.state}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
