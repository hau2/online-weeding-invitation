import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Invitation } from '@repo/types'
import { EditorShell } from './EditorShell'

async function getInvitation(id: string): Promise<Invitation | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const res = await fetch(`http://localhost:3001/invitations/${id}`, {
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
  const invitation = await getInvitation(id)
  if (!invitation) notFound()

  return <EditorShell invitation={invitation} />
}
