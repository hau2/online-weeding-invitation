import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Invitation } from '@repo/types'
import { ThankYouPage } from './ThankYouPage'
import { InvitationShell } from './InvitationShell'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ISR: revalidate every 1 hour as fallback, on-demand revalidation on publish
export const revalidate = 3600

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

async function getInvitation(slug: string): Promise<PublicInvitation | null> {
  try {
    const res = await fetch(`${API_URL}/invitations/public/${slug}`, {
      next: { tags: [`invitation-${slug}`] },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const invitation = await getInvitation(slug)
  if (!invitation) return {}

  const ogImage = invitation.photoUrls?.[0] ?? '/default-og.jpg'
  const title = `Thiep cuoi ${invitation.groomName} & ${invitation.brideName}`

  const datePart = invitation.weddingDate
    ? new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(invitation.weddingDate))
    : ''
  const description = [datePart, invitation.venueName].filter(Boolean).join(' - ')

  return {
    title: { absolute: title },
    description,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
    openGraph: {
      title,
      description: description || 'Tran trong kinh moi',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'vi_VN',
    },
  }
}

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const invitation = await getInvitation(slug)
  if (!invitation) notFound()

  if (invitation.expired) {
    return <ThankYouPage invitation={invitation} />
  }

  return <InvitationShell invitation={invitation} />
}
