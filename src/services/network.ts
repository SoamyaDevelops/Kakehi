import { supabase } from '../lib/supabase'
import type { NetworkStatus } from '../types/database'

/**
 * Asks the database whether THIS request comes from a trusted network.
 * The decision is made server-side from request headers; the client only displays it.
 * Replaceable: swap this module (and the SQL is_trusted_network()) for a RADIUS /
 * network-controller integration later without touching the UI.
 */
export async function fetchNetworkStatus(): Promise<NetworkStatus> {
  const { data, error } = await supabase.rpc('network_status')
  if (error) throw error
  return data as NetworkStatus
}
