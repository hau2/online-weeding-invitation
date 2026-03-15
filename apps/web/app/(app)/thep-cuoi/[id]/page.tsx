import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Invitation } from '@repo/types'
import { EditorShell } from './EditorShell'

async function getInvitation(id: string): Promise<Invitation | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const url = `${apiUrl}/invitations/${id}`
    console.log('[EditorPage] fetching:', url)
    const res = await fetch(url, {
      headers: { Cookie: `auth-token=${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[EditorPage] API error:', res.status, body)
      return null
    }
    return res.json()
  } catch (err) {
    console.error('[EditorPage] fetch error:', err)
    return null
  }
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invitation = await getInvitation(id)
  if (!invitation) notFound()

  return <EditorShell invitation={invitation} />
}
