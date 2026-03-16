'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import { CountdownTimer } from './CountdownTimer'
import { parseGuestName } from './utils'
import { motion } from 'framer-motion'
import { getTheme } from '@/components/templates/themes'
import { plusJakartaSans } from '@/lib/fonts'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
  isSaveTheDate?: boolean
}

interface SaveTheDatePageProps {
  invitation: PublicInvitation
}

export function SaveTheDatePage({ invitation }: SaveTheDatePageProps) {
  const [guestName, setGuestName] = useState<string | null>(null)
  const theme = getTheme(invitation.templateId)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setGuestName(parseGuestName(params))
  }, [])

  // Use the later of groom/bride ceremony dates
  const ceremonyDate = getLaterDate(
    invitation.groomCeremonyDate,
    invitation.brideCeremonyDate,
  )

  const formattedDate = ceremonyDate
    ? new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(ceremonyDate))
    : null

  const firstPhoto = invitation.photoUrls?.[0]

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center px-4 py-12',
        plusJakartaSans.variable,
        'font-[family-name:var(--font-display)]'
      )}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <motion.div
        className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Guest greeting */}
        {guestName && (
          <p
            className="text-base"
            style={{ fontFamily: "'Dancing Script', cursive", color: theme.primaryColor }}
          >
            Kinh gui {guestName}
          </p>
        )}

        {/* Save the Date heading */}
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: theme.primaryColor }}
        >
          Save the Date
        </h1>

        {/* Couple names */}
        <h2
          className="text-3xl sm:text-4xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: theme.textColor }}
        >
          {invitation.groomName} &amp; {invitation.brideName}
        </h2>

        {/* Wedding date */}
        {formattedDate && (
          <p style={{ color: theme.textColor }} className="text-lg">
            {formattedDate}
          </p>
        )}

        {/* First photo */}
        {firstPhoto && (
          <div className="w-full max-w-xs mx-auto">
            <img
              src={firstPhoto}
              alt={`${invitation.groomName} va ${invitation.brideName}`}
              className="w-full rounded-xl shadow-lg border-2 object-cover aspect-[3/4]"
              style={{ borderColor: theme.primaryColor }}
            />
          </div>
        )}

        {/* Teaser message */}
        {invitation.teaserMessage && (
          <p
            className="text-base leading-relaxed max-w-sm whitespace-pre-line"
            style={{ color: theme.textColor }}
          >
            {invitation.teaserMessage}
          </p>
        )}

        {/* Countdown timer */}
        {ceremonyDate && (
          <CountdownTimer
            ceremonyDate={ceremonyDate}
            templateId={invitation.templateId}
          />
        )}

        {/* Footer */}
        <p className="text-sm mt-4" style={{ color: theme.mutedTextColor }}>
          Thiep cuoi chinh thuc se duoc gui sau
        </p>
      </motion.div>
    </div>
  )
}

/**
 * Returns the later of two date strings, or the non-null one.
 */
function getLaterDate(a: string | null, b: string | null): string | null {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}
