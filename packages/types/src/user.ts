export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  isLocked?: boolean
  createdAt: string
  updatedAt: string
}

export interface UserPublic {
  id: string
  email: string
  role: UserRole
}
