'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import { SharedTemplate } from '@/components/templates/SharedTemplate'
import { StickyNav } from '@/components/templates/sections/StickyNav'
import { getTheme, buildThemeConfig } from '@/components/templates/themes'
import { plusJakartaSans } from '@/lib/fonts'
import { Watermark } from './Watermark'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
  watermarkText?: string
  watermarkOpacity?: number
}

interface InvitationShellProps {
  invitation: PublicInvitation
  themeConfig?: Record<string, unknown>
}

// Dynamic imports for heavy client components (avoid SSR issues)
const EnvelopeAnimation = dynamic(
  () => import('./EnvelopeAnimation').then((m) => ({ default: m.EnvelopeAnimation })),
  { ssr: false }
)
const FallingPetals = dynamic(
  () => import('./FallingPetals').then((m) => ({ default: m.FallingPetals })),
  { ssr: false }
)
const MusicPlayer = dynamic(
  () => import('./MusicPlayer').then((m) => ({ default: m.MusicPlayer })),
  { ssr: false }
)

function sanitizeGuestName(raw: string): string {
  // Strip HTML/script tags, max 50 characters
  const stripped = raw.replace(/<[^>]*>/g, '').trim()
  return stripped.slice(0, 50)
}

export function InvitationShell({ invitation, themeConfig }: InvitationShellProps) {
  const [envelopeOpened, setEnvelopeOpened] = useState(false)
  const [guestName, setGuestName] = useState<string | undefined>(undefined)
  const [side, setSide] = useState<'groom' | 'bride'>('groom')

  // Resolve theme: use custom themeConfig from API if present, otherwise fall back to built-in
  const theme = themeConfig ? buildThemeConfig(themeConfig) : getTheme(invitation.templateId)

  useEffect(() => {
    // Parse ?to= and ?side= client-side only (never sent to server)
    const params = new URLSearchParams(window.location.search)
    const toParam = params.get('to')
    if (toParam) {
      setGuestName(sanitizeGuestName(toParam))
    }
    const sideParam = params.get('side')
    setSide(sideParam === 'bride' ? 'bride' : 'groom')
  }, [])

  // Filter invitation fields based on side -- hide the other side's ceremony + bank QR
  // Parents' names from BOTH families are always visible (Vietnamese cultural norm)
  const filteredInvitation = useMemo(() => {
    if (side === 'groom') {
      return {
        ...invitation,
        // Hide bride-side ceremony + bank QR (parents stay visible)
        brideCeremonyDate: null, brideCeremonyTime: null,
        brideVenueName: '', brideVenueAddress: '',
        brideBankQrUrl: null, brideBankName: '', brideBankAccountHolder: '', brideBankAccountNumber: '',
      }
    } else {
      return {
        ...invitation,
        // Hide groom-side ceremony + bank QR (parents stay visible)
        groomCeremonyDate: null, groomCeremonyTime: null,
        groomVenueName: '', groomVenueAddress: '',
        bankQrUrl: null, bankName: '', bankAccountHolder: '', bankAccountNumber: '',
      }
    }
  }, [invitation, side])

  // Determine active side's ceremony date for countdown
  const ceremonyDate = side === 'groom' ? invitation.groomCeremonyDate : invitation.brideCeremonyDate
  const ceremonyTime = side === 'groom' ? invitation.groomCeremonyTime : invitation.brideCeremonyTime

  // Envelope stage: fullscreen envelope animation (centered ~400px, unchanged per locked decision)
  if (!envelopeOpened) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        {/* Falling petals during envelope stage */}
        <FallingPetals petalColors={theme.petalColors} enabled={theme.petalEnabled} />
        <EnvelopeAnimation
          templateId={invitation.templateId}
          groomName={invitation.groomName}
          brideName={invitation.brideName}
          guestName={guestName}
          onOpen={() => setEnvelopeOpened(true)}
        />
        {(invitation.plan ?? 'free') === 'free' && <Watermark text={invitation.watermarkText} opacity={invitation.watermarkOpacity} />}
      </div>
    )
  }

  // Revealed stage: full-width invitation with SharedTemplate + StickyNav
  return (
    <div className={cn('relative min-h-screen', plusJakartaSans.variable, 'font-[family-name:var(--font-display)]')}>
      {/* Falling petals continue throughout the invitation (z-30) */}
      <FallingPetals petalColors={theme.petalColors} enabled={theme.petalEnabled} />

      {/* Music player (auto-starts after envelope opens, z-50) */}
      {invitation.musicUrl && (
        <MusicPlayer musicUrl={invitation.musicUrl} autoStart={true} />
      )}

      {/* StickyNav -- desktop only, outside content scroll container (z-40) */}
      <StickyNav invitation={filteredInvitation} theme={theme} />

      {/* Invitation content with fade-in */}
      <AnimatePresence>
        <motion.div
          key="invitation-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <SharedTemplate
            invitation={filteredInvitation}
            theme={theme}
            ceremonyDate={ceremonyDate}
            ceremonyTime={ceremonyTime}
          />
        </motion.div>
      </AnimatePresence>

      {/* Watermark overlay for free tier (z-[60]) */}
      {(invitation.plan ?? 'free') === 'free' && <Watermark text={invitation.watermarkText} opacity={invitation.watermarkOpacity} />}
    </div>
  )
}
