import { cookies } from 'next/headers'
import type { Invitation, UserProfile } from '@repo/types'
import { DashboardClient } from '@/components/app/DashboardClient'

async function getInvitations(): Promise<Invitation[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return []

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const res = await fetch(`${apiUrl}/invitations`, {
      headers: { Cookie: `auth-token=${token}` },
      cache: 'no-store',  // always fresh list
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Cookie: `auth-token=${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const [invitations, profile] = await Promise.all([
    getInvitations(),
    getUserProfile(),
  ])
  return <DashboardClient invitations={invitations} userProfile={profile} />
}
