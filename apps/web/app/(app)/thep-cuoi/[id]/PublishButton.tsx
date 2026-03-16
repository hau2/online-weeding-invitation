'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { MoreVertical, EyeOff, Copy, Share2, Globe, CalendarHeart } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PublishButtonProps {
  invitation: Invitation
  onPublished: (updated: Invitation) => void
  onUnpublished: (updated: Invitation) => void
}

export function PublishButton({
  invitation,
  onPublished,
  onUnpublished,
}: PublishButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCelebrationDialog, setShowCelebrationDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [showSaveTheDateConfirmDialog, setShowSaveTheDateConfirmDialog] = useState(false)
  const [showTransitionDialog, setShowTransitionDialog] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)
  const [groomUrl, setGroomUrl] = useState('')
  const [brideUrl, setBrideUrl] = useState('')
  const [celebrationType, setCelebrationType] = useState<'save_the_date' | 'published'>('published')

  const isPublished = invitation.status === 'published'
  const isSaveTheDate = invitation.status === 'save_the_date'
  const isFirstPublish = !invitation.slug

  const handlePublishClick = useCallback(() => {
    // Validate required fields
    if (!invitation.groomName || !invitation.brideName) {
      toast.error('Vui long nhap ten co dau va chu re truoc khi xuat ban')
      return
    }
    if (isSaveTheDate) {
      // Transition from save_the_date to published -- show transition dialog
      setShowTransitionDialog(true)
    } else {
      setShowConfirmDialog(true)
    }
  }, [invitation.groomName, invitation.brideName, isSaveTheDate])

  const handleSaveTheDateClick = useCallback(() => {
    // Validate minimum fields for save-the-date
    if (!invitation.groomName || !invitation.brideName) {
      toast.error('Vui long nhap ten co dau va chu re')
      return
    }
    if (!invitation.groomCeremonyDate && !invitation.brideCeremonyDate) {
      toast.error('Vui long chon it nhat mot ngay le')
      return
    }
    setShowSaveTheDateConfirmDialog(true)
  }, [invitation.groomName, invitation.brideName, invitation.groomCeremonyDate, invitation.brideCeremonyDate])

  const handleConfirmPublish = useCallback(async () => {
    setPublishing(true)
    const wasFirstPublish = isFirstPublish

    const { data, error } = await apiFetch<Invitation>(
      `/invitations/${invitation.id}/publish`,
      { method: 'POST', credentials: 'include' },
    )

    setPublishing(false)
    setShowConfirmDialog(false)
    setShowTransitionDialog(false)

    if (error) {
      toast.error(error)
      return
    }

    if (data) {
      const origin = window.location.origin
      setGroomUrl(`${origin}/w/${data.slug}?side=groom`)
      setBrideUrl(`${origin}/w/${data.slug}?side=bride`)
      onPublished(data)

      if (wasFirstPublish || isSaveTheDate) {
        setCelebrationType('published')
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
  }, [invitation.id, isFirstPublish, isSaveTheDate, onPublished])

  const handleConfirmSaveTheDate = useCallback(async () => {
    setPublishing(true)
    const wasFirstPublish = isFirstPublish

    const { data, error } = await apiFetch<Invitation>(
      `/invitations/${invitation.id}/publish-save-the-date`,
      { method: 'POST', credentials: 'include' },
    )

    setPublishing(false)
    setShowSaveTheDateConfirmDialog(false)

    if (error) {
      toast.error(error)
      return
    }

    if (data) {
      const origin = window.location.origin
      setGroomUrl(`${origin}/w/${data.slug}?side=groom`)
      setBrideUrl(`${origin}/w/${data.slug}?side=bride`)
      onPublished(data)

      if (wasFirstPublish) {
        setCelebrationType('save_the_date')
        setShowCelebrationDialog(true)
        setTimeout(async () => {
          try {
            const confetti = (await import('canvas-confetti')).default
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
            setTimeout(() => {
              confetti({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.5 },
              })
            }, 250)
          } catch {
            // Confetti is non-critical
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

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Da sao chep lien ket')
    } catch {
      toast.error('Khong the sao chep lien ket')
    }
  }, [])

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
        ) : isSaveTheDate ? (
          <Button
            className="bg-teal-500 text-white hover:bg-teal-600"
            size="sm"
            onClick={handlePublishClick}
          >
            <Globe className="size-3.5" />
            Save the Date
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-200 hover:bg-teal-50 gap-1"
              onClick={handleSaveTheDateClick}
            >
              <CalendarHeart className="size-3.5" />
              Save the Date
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              size="sm"
              onClick={handlePublishClick}
            >
              Xuat ban
            </Button>
          </>
        )}

        {(isPublished || isSaveTheDate) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              {isSaveTheDate && (
                <DropdownMenuItem onClick={handlePublishClick}>
                  <Globe className="size-4" />
                  Xuat ban day du
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowUnpublishDialog(true)}
              >
                <EyeOff className="size-4" />
                {isSaveTheDate ? 'Huy Save the Date' : 'Huy xuat ban'}
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

      {/* Save the Date confirmation dialog */}
      <Dialog
        open={showSaveTheDateConfirmDialog}
        onOpenChange={setShowSaveTheDateConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gui Save the Date</DialogTitle>
            <DialogDescription>
              {isFirstPublish ? (
                <>
                  He thong se tao duong link tu dong. Khach moi se thay trang Save the Date voi ten cap doi, ngay cuoi va dem nguoc.{' '}
                  <strong className="text-teal-700">
                    Duong link se khong the thay doi.
                  </strong>
                </>
              ) : (
                <>
                  Ban muon gui lai Save the Date?
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
              onClick={() => setShowSaveTheDateConfirmDialog(false)}
              disabled={publishing}
            >
              Huy
            </Button>
            <Button
              className="bg-teal-500 text-white hover:bg-teal-600"
              onClick={handleConfirmSaveTheDate}
              disabled={publishing}
            >
              {publishing ? 'Dang gui...' : 'Gui Save the Date'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition dialog: save_the_date -> published */}
      <Dialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuat ban thiep cuoi day du</DialogTitle>
            <DialogDescription>
              Dieu nay se thay the Save the Date bang thiep cuoi day du. Khach moi se thay thiep cuoi hoan chinh voi tat ca thong tin. Tiep tuc?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransitionDialog(false)}
              disabled={publishing}
            >
              Huy
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={handleConfirmPublish}
              disabled={publishing}
            >
              {publishing ? 'Dang xuat ban...' : 'Xuat ban day du'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration dialog (first publish / save-the-date transition) */}
      <Dialog
        open={showCelebrationDialog}
        onOpenChange={setShowCelebrationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              {celebrationType === 'save_the_date' ? 'Save the Date da duoc xuat ban!' : 'Thiep cuoi da duoc xuat ban!'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {celebrationType === 'save_the_date' ? 'Chia se link nay de thong bao ngay cuoi' : 'Chia se duong link nay voi khach moi cua ban'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 min-w-0">
              <span className="text-xs text-rose-500 font-medium shrink-0">Nha trai</span>
              <span className="min-w-0 flex-1 truncate text-sm text-rose-800 select-all">
                {groomUrl}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopyUrl(groomUrl)}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 min-w-0">
              <span className="text-xs text-rose-500 font-medium shrink-0">Nha gai</span>
              <span className="min-w-0 flex-1 truncate text-sm text-rose-800 select-all">
                {brideUrl}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopyUrl(brideUrl)}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCelebrationDialog(false)}>
              Dong
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => handleCopyUrl(groomUrl)}
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
            <DialogTitle>{isSaveTheDate ? 'Huy Save the Date' : 'Huy xuat ban'}</DialogTitle>
            <DialogDescription>
              {isSaveTheDate
                ? 'Ban muon huy Save the Date? Khach moi se khong the truy cap trang Save the Date cho den khi ban gui lai.'
                : 'Ban muon huy xuat ban thiep cuoi? Khach moi se khong the truy cap thiep cuoi cua ban cho den khi ban xuat ban lai.'}
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
              {unpublishing ? 'Dang huy...' : isSaveTheDate ? 'Huy Save the Date' : 'Huy xuat ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
