import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Invitation } from '@repo/types'
import { ThankYouPage } from './ThankYouPage'
import { InvitationShell } from './InvitationShell'
import { SaveTheDatePage } from './SaveTheDatePage'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ISR: revalidate every 1 hour as fallback, on-demand revalidation on publish
export const revalidate = 3600

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
  isSaveTheDate?: boolean
  themeConfig?: Record<string, unknown>
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

  const datePart = invitation.groomCeremonyDate
    ? new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(invitation.groomCeremonyDate))
    : ''
  const description = [datePart, invitation.groomVenueName].filter(Boolean).join(' - ')

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

  if (invitation.isSaveTheDate) {
    return <SaveTheDatePage invitation={invitation} themeConfig={invitation.themeConfig} />
  }

  if (invitation.expired) {
    return <ThankYouPage invitation={invitation} themeConfig={invitation.themeConfig} />
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InvitationShell invitation={invitation} themeConfig={invitation.themeConfig} />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
        <p className="text-sm text-rose-400">Dang tai thiep cuoi...</p>
      </div>
    </div>
  )
}
