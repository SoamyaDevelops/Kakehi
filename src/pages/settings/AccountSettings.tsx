import { useState, type FormEvent } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { TextField, TextArea, PasswordField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { updateOwnProfile } from '../../services/profiles'
import { changePassword, friendlyAuthError } from '../../services/auth'
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability'
import { normalizeUsername, validateDisplayName, validatePassword, validateUsername } from '../../lib/validation'

function ProfileForm() {
  const { profile, setProfile } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const availability = useUsernameAvailability(username, profile?.username)

  if (!profile) return null

  const uErr = validateUsername(username) ?? (availability === 'taken' ? 'That username is taken. Try another.' : null)
  const dErr = validateDisplayName(displayName)
  const bErr = bio.length > 300 ? 'Use 300 characters or fewer.' : null
  const dirty =
    normalizeUsername(username) !== profile.username || displayName.trim() !== profile.display_name || bio !== profile.bio

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (uErr || dErr || bErr || !profile) return
    setBusy(true)
    try {
      const updated = await updateOwnProfile(profile.id, {
        username: normalizeUsername(username),
        display_name: displayName.trim(),
        bio,
      })
      setProfile(updated)
      setSubmitted(false)
      toast.success('Profile saved')
    } catch (err) {
      toast.error(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section" aria-labelledby="profile-h">
      <div className="section-head">
        <h2 id="profile-h">Profile</h2>
        <p className="muted small">This is what other students see.</p>
      </div>
      <form className="form" onSubmit={onSubmit} noValidate>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={submitted || username !== profile.username ? uErr : null}
          status={availability === 'checking' ? 'checking' : availability === 'available' ? 'ok' : undefined}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
        />
        <TextField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={submitted ? dErr : null} maxLength={60} />
        <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} error={bErr} hint={`${bio.length}/300`} />
        <div className="form-actions">
          <Button type="submit" variant="primary" loading={busy} disabled={!dirty}>Save changes</Button>
        </div>
      </form>
    </section>
  )
}

function PasswordForm() {
  const toast = useToast()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const err = validatePassword(pw)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (err) return
    setBusy(true)
    try {
      await changePassword(pw)
      setPw('')
      setSubmitted(false)
      toast.success('Password changed')
    } catch (e2) {
      toast.error(friendlyAuthError(e2))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section" aria-labelledby="pw-h">
      <div className="section-head">
        <h2 id="pw-h">Password</h2>
        <p className="muted small">Choose a new password for this account.</p>
      </div>
      <form className="form" onSubmit={onSubmit} noValidate>
        <PasswordField label="New password" value={pw} onChange={(e) => setPw(e.target.value)} error={submitted ? err : null} autoComplete="new-password" />
        <div className="form-actions">
          <Button type="submit" loading={busy} disabled={!pw}>Change password</Button>
        </div>
      </form>
    </section>
  )
}

function SignOutSection() {
  const { signOut } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  return (
    <section className="section" aria-labelledby="so-h">
      <div className="section-head">
        <h2 id="so-h">Sign out</h2>
        <p className="muted small">You’ll need your username and password to come back.</p>
      </div>
      <div className="form-actions">
        <Button
          icon={<LogOut size={16} aria-hidden />}
          loading={busy}
          onClick={async () => {
            setBusy(true)
            try { await signOut() } catch { toast.error('Couldn’t sign out. Try again.'); setBusy(false) }
          }}
        >
          Sign out
        </Button>
      </div>
    </section>
  )
}

export default function AccountSettings() {
  return (
    <>
      <ProfileForm />
      <PasswordForm />
      <SignOutSection />
    </>
  )
}
