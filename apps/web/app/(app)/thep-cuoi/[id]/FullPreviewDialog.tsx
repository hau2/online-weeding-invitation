'use client'

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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FullPreviewDialog({
  invitation,
  open,
  onOpenChange,
}: FullPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Xem truoc thiep cuoi</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto rounded-lg border border-rose-100 bg-white">
          <TemplateRenderer invitation={invitation} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
