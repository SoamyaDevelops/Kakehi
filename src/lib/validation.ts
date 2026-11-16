export const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export function normalizeUsername(v: string) {
  return v.trim().toLowerCase()
}

export function validateUsername(v: string): string | null {
  const u = normalizeUsername(v)
  if (!u) return 'Choose a username.'
  if (u.length < 3) return 'Use at least 3 characters.'
  if (u.length > 20) return 'Use 20 characters or fewer.'
  if (!USERNAME_RE.test(u)) return 'Use only letters, numbers and underscores.'
  return null
}

export function validateDisplayName(v: string): string | null {
  const d = v.trim()
  if (!d) return 'Enter the name others will see.'
  if (d.length > 60) return 'Use 60 characters or fewer.'
  return null
}

export function validatePassword(v: string): string | null {
  if (v.length < 8) return 'Use at least 8 characters.'
  if (v.length > 72) return 'Use 72 characters or fewer.'
  return null
}
