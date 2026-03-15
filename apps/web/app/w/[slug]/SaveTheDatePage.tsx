'use client'

import { useState, useEffect } from 'react'
import type { Invitation, TemplateId } from '@repo/types'
import { CountdownTimer } from './CountdownTimer'
import { parseGuestName } from './utils'
import { motion } from 'framer-motion'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
  isSaveTheDate?: boolean
}

interface SaveTheDatePageProps {
  invitation: PublicInvitation
}

const TEMPLATE_COLORS: Record<
  TemplateId,
  {
    bg: string
    text: string
    heading: string
    accent: string
    muted: string
    photoBorder: string
  }
> = {
  traditional: {
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    heading: 'text-rose-800',
    accent: 'text-amber-700',
    muted: 'text-rose-400',
    photoBorder: 'border-amber-300',
  },
  modern: {
    bg: 'bg-white',
    text: 'text-gray-900',
    heading: 'text-gray-800',
    accent: 'text-rose-400',
    muted: 'text-gray-400',
    photoBorder: 'border-rose-200',
  },
  minimalist: {
    bg: 'bg-amber-50',
    text: 'text-gray-800',
    heading: 'text-gray-700',
    accent: 'text-gray-500',
    muted: 'text-gray-400',
    photoBorder: 'border-gray-300',
  },
}

export function SaveTheDatePage({ invitation }: SaveTheDatePageProps) {
  const [guestName, setGuestName] = useState<string | null>(null)
  const colors = TEMPLATE_COLORS[invitation.templateId] ?? TEMPLATE_COLORS.traditional

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
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center px-4 py-12`}>
      <motion.div
        className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Guest greeting */}
        {guestName && (
          <p className={`text-base ${colors.accent}`} style={{ fontFamily: "'Dancing Script', cursive" }}>
            Kinh gui {guestName}
          </p>
        )}

        {/* Save the Date heading */}
        <h1
          className={`text-2xl sm:text-3xl font-bold ${colors.accent}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Save the Date
        </h1>

        {/* Couple names */}
        <h2
          className={`text-3xl sm:text-4xl font-bold ${colors.heading}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {invitation.groomName} &amp; {invitation.brideName}
        </h2>

        {/* Wedding date */}
        {formattedDate && (
          <p className={`text-lg ${colors.text}`}>
            {formattedDate}
          </p>
        )}

        {/* First photo */}
        {firstPhoto && (
          <div className="w-full max-w-xs mx-auto">
            <img
              src={firstPhoto}
              alt={`${invitation.groomName} va ${invitation.brideName}`}
              className={`w-full rounded-xl shadow-lg border-2 ${colors.photoBorder} object-cover aspect-[3/4]`}
            />
          </div>
        )}

        {/* Teaser message */}
        {invitation.teaserMessage && (
          <p className={`text-base leading-relaxed max-w-sm ${colors.text} whitespace-pre-line`}>
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
        <p className={`text-sm ${colors.muted} mt-4`}>
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
