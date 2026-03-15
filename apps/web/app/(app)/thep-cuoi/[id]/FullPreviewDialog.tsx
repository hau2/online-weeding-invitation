'use client'

import { useMemo } from 'react'
import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FullPreviewDialogProps {
  invitation: Invitation
  side: 'groom' | 'bride'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FullPreviewDialog({
  invitation,
  side,
  open,
  onOpenChange,
}: FullPreviewDialogProps) {
  // Filter invitation by side — parents always visible, ceremony + bank QR filtered
  const filtered = useMemo(() => {
    if (side === 'groom') {
      return {
        ...invitation,
        brideCeremonyDate: null, brideCeremonyTime: null,
        brideVenueName: '', brideVenueAddress: '',
        brideBankQrUrl: null, brideBankName: '', brideBankAccountHolder: '',
      }
    } else {
      return {
        ...invitation,
        groomCeremonyDate: null, groomCeremonyTime: null,
        groomVenueName: '', groomVenueAddress: '',
        bankQrUrl: null, bankName: '', bankAccountHolder: '',
      }
    }
  }, [invitation, side])

  const title = side === 'groom' ? 'Xem truoc — Nha trai' : 'Xem truoc — Nha gai'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto rounded-lg border border-rose-100 bg-white">
          <TemplateRenderer invitation={filtered} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
