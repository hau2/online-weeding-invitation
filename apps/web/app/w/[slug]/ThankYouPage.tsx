'use client'

import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import { getTheme } from '@/components/templates/themes'
import { plusJakartaSans } from '@/lib/fonts'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

interface ThankYouPageProps {
  invitation: PublicInvitation
}

const DEFAULT_THANK_YOU =
  'Xin chan thanh cam on quy khach da den chung vui cung chung toi.'

export function ThankYouPage({ invitation }: ThankYouPageProps) {
  const theme = getTheme(invitation.templateId)
  const firstPhoto = invitation.photoUrls?.[0]

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center p-6',
        plusJakartaSans.variable,
        'font-[family-name:var(--font-display)]'
      )}
      style={{ background: `linear-gradient(to bottom, ${theme.backgroundColor}, ${theme.surfaceColor})` }}
    >
      <div className="w-full max-w-md text-center">
        {/* Sub-heading */}
        <p
          className="mb-2 text-sm tracking-widest uppercase"
          style={{ color: theme.mutedTextColor }}
        >
          Cam on quy khach
        </p>

        {/* Couple names */}
        <h1
          className="mb-6 font-serif text-3xl font-bold"
          style={{ color: theme.primaryColor }}
        >
          {invitation.groomName} & {invitation.brideName}
        </h1>

        {/* Decorative divider */}
        <div
          className="mx-auto mb-6 w-16 border-t-2"
          style={{ borderColor: theme.primaryColor }}
        />

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
        <p
          className="mx-auto max-w-sm text-base leading-relaxed"
          style={{ color: theme.textColor }}
        >
          {invitation.thankYouText || DEFAULT_THANK_YOU}
        </p>
      </div>
    </div>
  )
}
