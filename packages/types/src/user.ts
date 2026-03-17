export type UserRole = 'user' | 'admin'
export type UserTier = 'user' | 'agent'

export interface User {
  id: string
  email: string
  role: UserRole
  tier?: UserTier
  isLocked?: boolean
  createdAt: string
  updatedAt: string
}

export interface UserPublic {
  id: string
  email: string
  role: UserRole
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  tier: UserTier
  subscriptionStart: string | null
  subscriptionEnd: string | null
  quotaUsed: number
  quotaLimit: number
  daysRemaining: number | null
}
