import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export async function fetchOwnProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function updateOwnProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'username' | 'display_name' | 'bio'>>,
): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select('*').single()
  if (error) throw error
  return data as Profile
}

export async function fetchIsOwner(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_owner')
  if (error) return false
  return data === true
}
