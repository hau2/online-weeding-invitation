import type { UserPublic } from './user'

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: UserPublic
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  token: string
  newPassword: string
}

export interface MessageResponse {
  message: string
}
