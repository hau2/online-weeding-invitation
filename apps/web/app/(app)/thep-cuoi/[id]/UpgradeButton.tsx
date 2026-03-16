'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock } from 'lucide-react'
import type { InvitationPlan, PaymentStatus } from '@repo/types'

interface UpgradeButtonProps {
  invitationId: string
  plan: InvitationPlan
  paymentStatus: PaymentStatus
}

export function UpgradeButton({ invitationId, plan, paymentStatus }: UpgradeButtonProps) {
  if (plan === 'premium') return null

  if (paymentStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock className="size-3" />
        Cho xac nhan
      </span>
    )
  }

  return (
    <Button
      render={<Link href={`/nang-cap/${invitationId}`} />}
      nativeButton={false}
      variant="ghost"
      size="sm"
      className="bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 gap-1 text-xs"
    >
      <Sparkles className="size-3" />
      Nang cap
    </Button>
  )
}
