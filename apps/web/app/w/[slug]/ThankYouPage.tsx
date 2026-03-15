'use client'

import type { Invitation, TemplateId } from '@repo/types'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

interface ThankYouPageProps {
  invitation: PublicInvitation
}

const TEMPLATE_COLORS: Record<
  TemplateId,
  { bg: string; heading: string; text: string; accent: string }
> = {
  traditional: {
    bg: 'from-red-50 to-amber-50',
    heading: 'text-[#8B1A1A]',
    text: 'text-[#5C3317]',
    accent: 'border-[#C9A84C]',
  },
  modern: {
    bg: 'from-rose-50 to-pink-50',
    heading: 'text-rose-800',
    text: 'text-rose-700',
    accent: 'border-rose-300',
  },
  minimalist: {
    bg: 'from-stone-50 to-gray-50',
    heading: 'text-gray-800',
    text: 'text-gray-600',
    accent: 'border-gray-300',
  },
}

const DEFAULT_THANK_YOU =
  'Xin chan thanh cam on quy khach da den chung vui cung chung toi.'

export function ThankYouPage({ invitation }: ThankYouPageProps) {
  const colors = TEMPLATE_COLORS[invitation.templateId] ?? TEMPLATE_COLORS.traditional
  const firstPhoto = invitation.photoUrls?.[0]

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${colors.bg} p-6`}
    >
      <div className="w-full max-w-md text-center">
        {/* Sub-heading */}
        <p className={`mb-2 text-sm tracking-widest uppercase ${colors.text}`}>
          Cam on quy khach
        </p>

        {/* Couple names */}
        <h1 className={`mb-6 font-serif text-3xl font-bold ${colors.heading}`}>
          {invitation.groomName} & {invitation.brideName}
        </h1>

        {/* Decorative divider */}
        <div className={`mx-auto mb-6 w-16 border-t-2 ${colors.accent}`} />

        {/* First photo */}
        {firstPhoto && (
          <div className="mx-auto mb-6 w-64 overflow-hidden rounded-2xl shadow-lg">
            <img
              src={firstPhoto}
              alt={`${invitation.groomName} & ${invitation.brideName}`}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Thank you text */}
        <p className={`mx-auto max-w-sm text-base leading-relaxed ${colors.text}`}>
          {invitation.thankYouText || DEFAULT_THANK_YOU}
        </p>
      </div>
    </div>
  )
}
