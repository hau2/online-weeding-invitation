'use client'

import type { Invitation } from '@repo/types'

type PublicInvitation = Invitation & {
  expired: boolean
  musicUrl?: string
}

interface ThankYouPageProps {
  invitation: PublicInvitation
}

export function ThankYouPage({ invitation }: ThankYouPageProps) {
  // Placeholder - will be fully implemented in Task 2
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-6">
      <h1 className="mb-4 font-serif text-3xl font-bold text-gray-800">
        {invitation.groomName} & {invitation.brideName}
      </h1>
      <p className="text-gray-600">
        {invitation.thankYouText ||
          'Xin chan thanh cam on quy khach da den chung vui cung chung toi.'}
      </p>
    </div>
  )
}
