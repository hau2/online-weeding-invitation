'use client'

import { useState } from 'react'
import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

interface InvitationShellProps {
  invitation: PublicInvitation
}

export function InvitationShell({ invitation }: InvitationShellProps) {
  // State placeholders for envelope and music (wired in Plan 05-04)
  const [envelopeOpened, setEnvelopeOpened] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)

  if (!envelopeOpened) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <div className="text-center">
          <p className="mb-4 text-sm tracking-widest text-gray-500 uppercase">
            Tran trong kinh moi
          </p>
          <h1 className="mb-6 font-serif text-3xl font-bold text-gray-800">
            {invitation.groomName} & {invitation.brideName}
          </h1>
          <button
            onClick={() => {
              setEnvelopeOpened(true)
              setMusicStarted(true)
            }}
            className="rounded-full bg-rose-500 px-8 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Mo thiep
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <TemplateRenderer invitation={invitation} />
    </div>
  )
}
