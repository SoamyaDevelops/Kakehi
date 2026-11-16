export type AccountStatus = 'active' | 'suspended' | 'deactivated'

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_path: string | null
  banner_path: string | null
  class_id: string | null
  status: AccountStatus
  created_at: string
  updated_at: string
}

export interface NetworkStatus {
  enforcement_active: boolean
  trusted: boolean
}
