import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Invitation, UserProfile } from '@repo/types'
import { EditorShell } from './EditorShell'

async function getInvitation(id: string, token: string): Promise<Invitation | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const url = `${apiUrl}/invitations/${id}`
    const res = await fetch(url, {
      headers: { Cookie: `auth-token=${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getUserProfile(token: string): Promise<UserProfile | null> {
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

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) notFound()

  const [invitation, profile] = await Promise.all([
    getInvitation(id, token),
    getUserProfile(token),
  ])
  if (!invitation) notFound()

  return <EditorShell invitation={invitation} isAgent={profile?.tier === 'agent'} />
}
