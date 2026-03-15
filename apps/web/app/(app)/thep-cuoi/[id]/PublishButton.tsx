'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { MoreVertical, Eye, EyeOff, Copy, Share2, Globe } from 'lucide-react'
import type { Invitation } from '@repo/types'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PublishButtonProps {
  invitation: Invitation
  onPublished: (updated: Invitation) => void
  onUnpublished: (updated: Invitation) => void
  onPreview?: () => void
}

export function PublishButton({
  invitation,
  onPublished,
  onUnpublished,
  onPreview,
}: PublishButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCelebrationDialog, setShowCelebrationDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')

  const isPublished = invitation.status === 'published'
  const isFirstPublish = !invitation.slug

  const handlePublishClick = useCallback(() => {
    // Validate required fields
    if (!invitation.groomName || !invitation.brideName) {
      toast.error('Vui long nhap ten co dau va chu re truoc khi xuat ban')
      return
    }
    setShowConfirmDialog(true)
  }, [invitation.groomName, invitation.brideName])

  const handleConfirmPublish = useCallback(async () => {
    setPublishing(true)
    const wasFirstPublish = isFirstPublish

    const { data, error } = await apiFetch<Invitation>(
      `/invitations/${invitation.id}/publish`,
      { method: 'POST', credentials: 'include' },
    )

    setPublishing(false)
    setShowConfirmDialog(false)

    if (error) {
      toast.error(error)
      return
    }

    if (data) {
      const url = `${window.location.origin}/w/${data.slug}`
      setPublishedUrl(url)
      onPublished(data)

      if (wasFirstPublish) {
        setShowCelebrationDialog(true)
        // Fire confetti after a short delay to let the dialog open
        setTimeout(async () => {
          try {
            const confetti = (await import('canvas-confetti')).default
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
            // Second burst for extra celebration
            setTimeout(() => {
              confetti({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.5 },
              })
            }, 250)
          } catch {
            // Confetti is non-critical -- silently ignore
          }
        }, 300)
      }
    }
  }, [invitation.id, isFirstPublish, onPublished])

  const handleConfirmUnpublish = useCallback(async () => {
    setUnpublishing(true)

    const { data, error } = await apiFetch<Invitation>(
      `/invitations/${invitation.id}/unpublish`,
      { method: 'POST', credentials: 'include' },
    )

    setUnpublishing(false)
    setShowUnpublishDialog(false)

    if (error) {
      toast.error(error)
      return
    }

    if (data) {
      onUnpublished(data)
    }
  }, [invitation.id, onUnpublished])

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl)
      toast.success('Da sao chep lien ket')
    } catch {
      toast.error('Khong the sao chep lien ket')
    }
  }, [publishedUrl])

  return (
    <>
      <div className="flex items-center gap-1">
        {isPublished ? (
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700"
            size="sm"
            onClick={handlePublishClick}
          >
            <Globe className="size-3.5" />
            Da xuat ban
          </Button>
        ) : (
          <Button
            className="bg-rose-500 text-white hover:bg-rose-600"
            size="sm"
            onClick={handlePublishClick}
          >
            Xuat ban
          </Button>
        )}

        {isPublished && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={() => onPreview?.()}>
                <Eye className="size-4" />
                Xem truoc
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowUnpublishDialog(true)}
              >
                <EyeOff className="size-4" />
                Huy xuat ban
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Publish confirmation dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuat ban thiep cuoi</DialogTitle>
            <DialogDescription>
              {isFirstPublish ? (
                <>
                  He thong se tao duong link tu dong cho thiep cuoi cua ban.{' '}
                  <strong className="text-rose-700">
                    Duong link se khong the thay doi sau khi xuat ban.
                  </strong>
                </>
              ) : (
                <>
                  Ban muon xuat ban lai thiep cuoi?
                  <br />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/w/${invitation.slug}`}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={publishing}
            >
              Huy
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={handleConfirmPublish}
              disabled={publishing}
            >
              {publishing ? 'Dang xuat ban...' : 'Xuat ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration dialog (first publish only) */}
      <Dialog
        open={showCelebrationDialog}
        onOpenChange={setShowCelebrationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              Thiep cuoi da duoc xuat ban!
            </DialogTitle>
            <DialogDescription className="text-center">
              Chia se duong link nay voi khach moi cua ban
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 min-w-0">
            <span className="min-w-0 flex-1 truncate text-sm text-rose-800 select-all">
              {publishedUrl}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyUrl}
            >
              <Copy className="size-4" />
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCelebrationDialog(false)}>
              Dong
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={handleCopyUrl}
            >
              <Share2 className="size-3.5" />
              Chia se ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish confirmation dialog */}
      <Dialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Huy xuat ban</DialogTitle>
            <DialogDescription>
              Ban muon huy xuat ban thiep cuoi? Khach moi se khong the truy cap thiep cuoi cua ban cho den khi ban xuat ban lai.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(false)}
              disabled={unpublishing}
            >
              Huy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUnpublish}
              disabled={unpublishing}
            >
              {unpublishing ? 'Dang huy...' : 'Huy xuat ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
