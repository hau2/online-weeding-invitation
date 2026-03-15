'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { EnvelopeAnimation } from './EnvelopeAnimation'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

interface InvitationShellProps {
  invitation: PublicInvitation
}

function sanitizeGuestName(raw: string): string {
  // Strip HTML/script tags, max 50 characters
  const stripped = raw.replace(/<[^>]*>/g, '').trim()
  return stripped.slice(0, 50)
}

export function InvitationShell({ invitation }: InvitationShellProps) {
  const searchParams = useSearchParams()
  const [envelopeOpened, setEnvelopeOpened] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const [guestName, setGuestName] = useState<string | undefined>(undefined)

  useEffect(() => {
    const toParam = searchParams.get('to')
    if (toParam) {
      setGuestName(sanitizeGuestName(toParam))
    }
  }, [searchParams])

  if (!envelopeOpened) {
    return (
      <EnvelopeAnimation
        templateId={invitation.templateId}
        groomName={invitation.groomName}
        brideName={invitation.brideName}
        guestName={guestName}
        onOpen={() => {
          setEnvelopeOpened(true)
          setMusicStarted(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <TemplateRenderer invitation={invitation} />
    </div>
  )
}
