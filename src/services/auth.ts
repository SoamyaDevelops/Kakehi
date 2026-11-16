import { supabase } from '../lib/supabase'
import { normalizeUsername } from '../lib/validation'

// Supabase Auth needs an email. Students sign in with a username, so we derive an
// internal address from it. No email is ever sent to it (email confirmation is off).
const INTERNAL_EMAIL_DOMAIN = 'kakehi.users.example.com'
export const toInternalEmail = (username: string) =>
  `${normalizeUsername(username)}@${INTERNAL_EMAIL_DOMAIN}`

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_username_available', { p_username: username })
  if (error) throw error
  return data === true
}

export async function signUp(input: { username: string; displayName: string; password: string }) {
  const { error, data } = await supabase.auth.signUp({
    email: toInternalEmail(input.username),
    password: input.password,
    options: {
      data: { username: normalizeUsername(input.username), display_name: input.displayName.trim() },
    },
  })
  if (error) throw error
  // With email confirmation off a session is returned immediately.
  if (!data.session) throw new Error('Account created, but sign-in is not enabled yet. Ask the owner to turn off email confirmation.')
}

export async function signIn(username: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: toInternalEmail(username),
    password,
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/** Turns Supabase/Postgres errors into short, actionable messages. */
export function friendlyAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Username or password is incorrect.'
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('profiles_username_key') || m.includes('duplicate key'))
    return 'That username is taken. Try another.'
  if (m.includes('database error saving new user')) return 'That username or name was not accepted. Check them and try again.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a minute and try again.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Can’t reach the server. Check your connection and try again.'
  if (m.includes('password')) return msg
  return 'Something went wrong. Try again.'
}
