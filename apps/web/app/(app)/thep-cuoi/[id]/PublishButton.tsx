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
      <div className="flex items-center gap-2">
        {isPublished ? (
          <button
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-teal-600 hover:bg-teal-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-teal-600/30 gap-2"
            onClick={handlePublishClick}
          >
            <Globe className="size-3.5" />
            <span className="truncate">Da xuat ban</span>
          </button>
        ) : isSaveTheDate ? (
          <button
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-teal-500 hover:bg-teal-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-teal-500/30 gap-2"
            onClick={handlePublishClick}
          >
            <Globe className="size-3.5" />
            <span className="truncate">Save the Date</span>
          </button>
        ) : (
          <>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-white border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors text-sm font-bold leading-normal tracking-[0.015em] gap-1.5"
              onClick={handleSaveTheDateClick}
            >
              <CalendarHeart className="size-3.5" />
              <span className="truncate">Save the Date</span>
            </button>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1349] hover:bg-red-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#ec1349]/30"
              onClick={handlePublishClick}
            >
              <span className="truncate">Xuat ban ngay</span>
            </button>
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

      {/* Publish confirmation dialog — Stitch-inspired styling */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-full bg-[#ec1349]/10 flex items-center justify-center mb-3 text-[#ec1349]">
                <Globe className="size-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#181113] tracking-tight">Xuat ban thiep cuoi</DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
                {isFirstPublish ? (
                  <>
                    He thong se tao duong link tu dong cho thiep cuoi cua ban.{' '}
                    <strong className="text-[#ec1349] font-medium">
                      Duong link se khong the thay doi sau khi xuat ban.
                    </strong>
                  </>
                ) : (
                  <>
                    Ban muon xuat ban lai thiep cuoi?
                    <br />
                    <span className="mt-2 block text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/w/${invitation.slug}`}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={publishing}
              className="border-gray-200"
            >
              Huy
            </Button>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1349] hover:bg-red-600 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleConfirmPublish}
              disabled={publishing}
            >
              {publishing ? 'Dang xuat ban...' : 'Xuat ban'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save the Date confirmation dialog — Stitch-inspired styling */}
      <Dialog
        open={showSaveTheDateConfirmDialog}
        onOpenChange={setShowSaveTheDateConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-full bg-teal-50 flex items-center justify-center mb-3 text-teal-600">
                <CalendarHeart className="size-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#181113] tracking-tight">Gui Save the Date</DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
                {isFirstPublish ? (
                  <>
                    He thong se tao duong link tu dong. Khach moi se thay trang Save the Date voi ten cap doi, ngay cuoi va dem nguoc.{' '}
                    <strong className="text-teal-700 font-medium">
                      Duong link se khong the thay doi.
                    </strong>
                  </>
                ) : (
                  <>
                    Ban muon gui lai Save the Date?
                    <br />
                    <span className="mt-2 block text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/w/${invitation.slug}`}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setShowSaveTheDateConfirmDialog(false)}
              disabled={publishing}
              className="border-gray-200"
            >
              Huy
            </Button>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-teal-500 hover:bg-teal-600 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleConfirmSaveTheDate}
              disabled={publishing}
            >
              {publishing ? 'Dang gui...' : 'Gui Save the Date'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition dialog: save_the_date -> published — Stitch-inspired styling */}
      <Dialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-full bg-[#ec1349]/10 flex items-center justify-center mb-3 text-[#ec1349]">
                <Globe className="size-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#181113] tracking-tight">Xuat ban thiep cuoi day du</DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
                Dieu nay se thay the Save the Date bang thiep cuoi day du. Khach moi se thay thiep cuoi hoan chinh voi tat ca thong tin. Tiep tuc?
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setShowTransitionDialog(false)}
              disabled={publishing}
              className="border-gray-200"
            >
              Huy
            </Button>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1349] hover:bg-red-600 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleConfirmPublish}
              disabled={publishing}
            >
              {publishing ? 'Dang xuat ban...' : 'Xuat ban day du'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration dialog (first publish / save-the-date transition) — Stitch-inspired styling */}
      <Dialog
        open={showCelebrationDialog}
        onOpenChange={setShowCelebrationDialog}
      >
        <DialogContent className="sm:max-w-md overflow-hidden">
          {/* Gradient background accent */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#fff0f4] to-transparent pointer-events-none" />
          <DialogHeader className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mb-4 text-green-600 ring-4 ring-green-100">
                <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <DialogTitle className="text-xl font-extrabold text-[#181113] tracking-tight">
                {celebrationType === 'save_the_date' ? 'Save the Date da duoc xuat ban!' : 'Thiep cuoi da duoc xuat ban!'}
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
                {celebrationType === 'save_the_date' ? 'Chia se link nay de thong bao ngay cuoi' : 'Chia se duong link nay voi khach moi cua ban'}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3 relative">
            {/* Groom link */}
            <div className="flex items-center gap-3 rounded-xl border border-[#e6dbde] bg-white p-3.5 min-w-0 shadow-sm">
              <span className="text-xs text-[#ec1349] font-bold shrink-0 uppercase tracking-wider">Nha trai</span>
              <span className="min-w-0 flex-1 truncate text-sm text-[#181113] select-all font-medium">
                {groomUrl}
              </span>
              <button
                className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#181113] shrink-0"
                onClick={() => handleCopyUrl(groomUrl)}
              >
                <Copy className="size-4" />
              </button>
            </div>
            {/* Bride link */}
            <div className="flex items-center gap-3 rounded-xl border border-[#e6dbde] bg-white p-3.5 min-w-0 shadow-sm">
              <span className="text-xs text-[#ec1349] font-bold shrink-0 uppercase tracking-wider">Nha gai</span>
              <span className="min-w-0 flex-1 truncate text-sm text-[#181113] select-all font-medium">
                {brideUrl}
              </span>
              <button
                className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#181113] shrink-0"
                onClick={() => handleCopyUrl(brideUrl)}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>

          <DialogFooter className="mt-3">
            <Button
              variant="outline"
              onClick={() => setShowCelebrationDialog(false)}
              className="border-gray-200"
            >
              Dong
            </Button>
            <button
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1349] hover:bg-red-600 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg gap-2"
              onClick={() => handleCopyUrl(groomUrl)}
            >
              <Share2 className="size-3.5" />
              Chia se ngay
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish confirmation dialog — Stitch-inspired styling */}
      <Dialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-full bg-red-50 flex items-center justify-center mb-3 text-red-500">
                <EyeOff className="size-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#181113] tracking-tight">
                {isSaveTheDate ? 'Huy Save the Date' : 'Huy xuat ban'}
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
                {isSaveTheDate
                  ? 'Ban muon huy Save the Date? Khach moi se khong the truy cap trang Save the Date cho den khi ban gui lai.'
                  : 'Ban muon huy xuat ban thiep cuoi? Khach moi se khong the truy cap thiep cuoi cua ban cho den khi ban xuat ban lai.'}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(false)}
              disabled={unpublishing}
              className="border-gray-200"
            >
              Huy bo
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
