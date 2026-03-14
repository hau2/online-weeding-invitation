'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiFetch } from './api'
import type { AuthResponse, MessageResponse } from '@repo/types'

const COOKIE_NAME = 'auth-token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days — matches JWT_EXPIRES_IN
}

export async function loginAction(email: string, password: string) {
  const { data, error } = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })

  if (error || !data) {
    return { error: error ?? 'Đăng nhập thất bại' }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, data.access_token, COOKIE_OPTIONS)

  redirect('/dashboard')
}

export async function registerAction(email: string, password: string) {
  const { data, error } = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password },
  })

  if (error || !data) {
    return { error: error ?? 'Đăng ký thất bại' }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, data.access_token, COOKIE_OPTIONS)

  redirect('/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    // Notify NestJS (best-effort — does not affect cookie clearing)
    await apiFetch<MessageResponse>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }

  cookieStore.delete(COOKIE_NAME)
  redirect('/dang-nhap')
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}
