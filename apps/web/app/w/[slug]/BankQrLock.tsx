'use client'

import { Lock } from 'lucide-react'

/**
 * Wraps bank QR images with blur + lock overlay for free-tier invitations.
 * Children (the <img> element) are blurred and non-interactive.
 * A lock icon and Vietnamese upgrade prompt are centered over the blur.
 */
export function BankQrLock({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="blur-md pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Lock className="size-8 text-gray-600" />
        <p className="mt-1 text-xs text-gray-500">Nang cap de mo QR</p>
      </div>
    </div>
  )
}
