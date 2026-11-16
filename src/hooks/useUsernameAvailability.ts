import { useEffect, useState } from 'react'
import { isUsernameAvailable } from '../services/auth'
import { normalizeUsername, validateUsername } from '../lib/validation'

export type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error'

/** Debounced server check that a (format-valid) username is free. */
export function useUsernameAvailability(value: string, skipIf?: string): Availability {
  const [state, setState] = useState<Availability>('idle')
  const u = normalizeUsername(value)

  useEffect(() => {
    if (validateUsername(u) || u === skipIf) {
      setState('idle')
      return
    }
    setState('checking')
    let cancelled = false
    const id = window.setTimeout(async () => {
      try {
        const ok = await isUsernameAvailable(u)
        if (!cancelled) setState(ok ? 'available' : 'taken')
      } catch {
        if (!cancelled) setState('error')
      }
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [u, skipIf])

  return state
}
