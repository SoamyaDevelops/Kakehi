import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchIsOwner, fetchOwnProfile } from '../services/profiles'
import * as authService from '../services/auth'
import type { Profile } from '../types/database'

interface AuthCtx {
  /** true until the stored session has been read */
  initializing: boolean
  session: Session | null
  profile: Profile | null
  /** true while the profile for a signed-in user is loading */
  profileLoading: boolean
  isOwner: boolean
  signIn: (username: string, password: string) => Promise<void>
  signUp: (input: { username: string; displayName: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setProfile: (p: Profile) => void
}
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })
    // Only store the session here; do not call Supabase inside this callback (can deadlock).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null

  const load = useCallback(async (id: string) => {
    setProfileLoading(true)
    try {
      const [p, owner] = await Promise.all([fetchOwnProfile(id), fetchIsOwner()])
      setProfile(p)
      setIsOwner(owner)
    } catch {
      setProfile(null)
      setIsOwner(false)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsOwner(false)
      return
    }
    void load(userId)
  }, [userId, load])

  const refreshProfile = useCallback(async () => {
    if (userId) await load(userId)
  }, [userId, load])

  const value = useMemo<AuthCtx>(
    () => ({
      initializing,
      session,
      profile,
      profileLoading,
      isOwner,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
      refreshProfile,
      setProfile,
    }),
    [initializing, session, profile, profileLoading, isOwner, refreshProfile],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}
