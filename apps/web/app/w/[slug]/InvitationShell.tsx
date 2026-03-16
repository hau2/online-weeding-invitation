'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import type { Invitation, TemplateId } from '@repo/types'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { Watermark } from './Watermark'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
  watermarkText?: string
  watermarkOpacity?: number
}

interface InvitationShellProps {
  invitation: PublicInvitation
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
const CountdownTimer = dynamic(
  () => import('./CountdownTimer').then((m) => ({ default: m.CountdownTimer })),
  { ssr: false }
)

// Template-specific background colors for envelope stage
const ENVELOPE_BG: Record<TemplateId, string> = {
  traditional: '#FFF5F5',
  modern: '#FFF0F5',
  minimalist: '#FFFFF0',
}

function sanitizeGuestName(raw: string): string {
  // Strip HTML/script tags, max 50 characters
  const stripped = raw.replace(/<[^>]*>/g, '').trim()
  return stripped.slice(0, 50)
}

export function InvitationShell({ invitation }: InvitationShellProps) {
  const [envelopeOpened, setEnvelopeOpened] = useState(false)
  const [guestName, setGuestName] = useState<string | undefined>(undefined)
  const [side, setSide] = useState<'groom' | 'bride'>('groom')

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
        brideBankQrUrl: null, brideBankName: '', brideBankAccountHolder: '',
      }
    } else {
      return {
        ...invitation,
        // Hide groom-side ceremony + bank QR (parents stay visible)
        groomCeremonyDate: null, groomCeremonyTime: null,
        groomVenueName: '', groomVenueAddress: '',
        bankQrUrl: null, bankName: '', bankAccountHolder: '',
      }
    }
  }, [invitation, side])

  // Determine active side's ceremony date for countdown
  const ceremonyDate = side === 'groom' ? invitation.groomCeremonyDate : invitation.brideCeremonyDate
  const ceremonyTime = side === 'groom' ? invitation.groomCeremonyTime : invitation.brideCeremonyTime

  // Envelope stage: fullscreen envelope animation
  if (!envelopeOpened) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: ENVELOPE_BG[invitation.templateId] }}
      >
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

  // Revealed stage: full invitation with all interactive components
  return (
    <div className="relative min-h-screen">
      {/* Falling petals overlay */}
      <FallingPetals templateId={invitation.templateId} enabled={true} />

      {/* Music player (auto-starts after envelope opens) */}
      {invitation.musicUrl && (
        <MusicPlayer musicUrl={invitation.musicUrl} autoStart={true} />
      )}

      {/* Invitation content with fade-in */}
      <AnimatePresence>
        <motion.div
          key="invitation-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Scrollable content container */}
          <div className="overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
            {/* 1. Full invitation template content (side-filtered) */}
            <TemplateRenderer invitation={filteredInvitation} />

            {/* 2. Countdown timer (uses active side's ceremony date) */}
            {ceremonyDate && (
              <div className="px-4 pb-4">
                <CountdownTimer
                  ceremonyDate={ceremonyDate}
                  ceremonyTime={ceremonyTime}
                  templateId={invitation.templateId}
                />
              </div>
            )}

            {/* 3. QR code (if available) */}
            {invitation.qrCodeUrl && (
              <div className="flex flex-col items-center px-4 pb-8">
                <p className="mb-3 text-sm text-gray-500">
                  Quet ma de xem thiep cuoi
                </p>
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <img
                    src={invitation.qrCodeUrl}
                    alt="QR code thiep cuoi"
                    className="h-40 w-40 object-contain"
                  />
                </div>
              </div>
            )}

            {/* 4. Footer */}
            <footer className="pb-8 pt-4 text-center">
              {(invitation.plan ?? 'free') === 'free' ? (
                <p className="text-xs text-gray-400">
                  Thiep cuoi duoc tao boi ThiepCuoiOnline.vn
                </p>
              ) : null}
            </footer>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Watermark overlay for free tier */}
      {(invitation.plan ?? 'free') === 'free' && <Watermark text={invitation.watermarkText} opacity={invitation.watermarkOpacity} />}
    </div>
  )
}
