import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchNetworkStatus } from '../services/network'
import type { NetworkStatus } from '../types/database'

type State =
  | { phase: 'checking' }
  | { phase: 'ready'; status: NetworkStatus }
  | { phase: 'error' }

interface NetworkCtx {
  state: State
  recheck: () => Promise<void>
}
const Ctx = createContext<NetworkCtx | null>(null)
const RECHECK_MS = 5 * 60 * 1000

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ phase: 'checking' })

  const recheck = useCallback(async () => {
    try {
      const status = await fetchNetworkStatus()
      setState({ phase: 'ready', status })
    } catch {
      // Keep a previous good answer on transient failures; only show the error on first load.
      setState((s) => (s.phase === 'ready' ? s : { phase: 'error' }))
    }
  }, [])

  useEffect(() => {
    void recheck()
    const id = window.setInterval(() => void recheck(), RECHECK_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') void recheck() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onVisible)
    }
  }, [recheck])

  const value = useMemo(() => ({ state, recheck }), [state, recheck])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNetwork() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useNetwork must be used inside NetworkProvider')
  return c
}
