'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Heart, Monitor, Smartphone, Share2, Copy, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates'
import { PublishButton } from '../PublishButton'
import { plusJakartaSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Tab = 'phone' | 'desktop' | 'share'

interface PreviewShellProps {
  invitation: Invitation
}

export function PreviewShell({ invitation: initial }: PreviewShellProps) {
  const [invitation, setInvitation] = useState(initial)
  const [activeTab, setActiveTab] = useState<Tab>('phone')
  const [previewSide, setPreviewSide] = useState<'groom' | 'bride'>('groom')

  // Side filtering -- same logic as FullPreviewDialog
  const filtered = useMemo(() => {
    if (previewSide === 'groom') {
      return {
        ...invitation,
        brideCeremonyDate: null,
        brideCeremonyTime: null,
        brideVenueName: '',
        brideVenueAddress: '',
        brideBankQrUrl: null,
        brideBankName: '',
        brideBankAccountHolder: '',
      }
    } else {
      return {
        ...invitation,
        groomCeremonyDate: null,
        groomCeremonyTime: null,
        groomVenueName: '',
        groomVenueAddress: '',
        bankQrUrl: null,
        bankName: '',
        bankAccountHolder: '',
      }
    }
  }, [invitation, previewSide])

  const handlePublished = useCallback((updated: Invitation) => {
    setInvitation(updated)
  }, [])

  const handleUnpublished = useCallback((updated: Invitation) => {
    setInvitation(updated)
  }, [])

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Da sao chep lien ket')
    } catch {
      toast.error('Khong the sao chep lien ket')
    }
  }, [])

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'phone', label: 'Dien thoai', icon: <Smartphone className="size-4" /> },
    { key: 'desktop', label: 'May tinh', icon: <Monitor className="size-4" /> },
    { key: 'share', label: 'Chia se lien ket', icon: <Share2 className="size-4" /> },
  ]

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = invitation.slug ? `${origin}/w/${invitation.slug}` : null

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-red-500" fill="currentColor" />
          <h1 className="text-base font-semibold text-gray-900">Xem truoc thiep</h1>
        </div>
        <div className="flex-1" />
        <Link href={`/thep-cuoi/${invitation.id}`}>
          <Button variant="outline" size="sm">
            Quay lai chinh sua
          </Button>
        </Link>
        <PublishButton
          invitation={invitation}
          onPublished={handlePublished}
          onUnpublished={handleUnpublished}
        />
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-center gap-6 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Side toggle -- only for phone/desktop tabs */}
        {activeTab !== 'share' && (
          <div className="flex justify-center pb-3">
            <div className="inline-flex rounded-full bg-gray-100 p-0.5">
              <button
                onClick={() => setPreviewSide('groom')}
                className={cn(
                  'px-4 py-1 text-xs font-medium rounded-full transition-colors',
                  previewSide === 'groom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Nha trai
              </button>
              <button
                onClick={() => setPreviewSide('bride')}
                className={cn(
                  'px-4 py-1 text-xs font-medium rounded-full transition-colors',
                  previewSide === 'bride'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Nha gai
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'phone' && (
          <div className="flex justify-center py-8">
            <div className="relative w-[280px] h-[560px] rounded-[2.5rem] border-4 border-gray-800 bg-gray-800 shadow-xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-b-2xl z-10" />
              {/* Screen */}
              <div
                className={cn(
                  'w-full h-full overflow-y-auto bg-white rounded-[2rem] pt-5',
                  plusJakartaSans.variable,
                  'font-[family-name:var(--font-display)]',
                )}
              >
                <TemplateRenderer invitation={filtered} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'desktop' && (
          <div className="flex justify-center py-8">
            <div className="relative w-[680px] max-w-[90vw] h-[480px] rounded-lg border-2 border-gray-300 bg-gray-100 shadow-lg overflow-hidden">
              {/* Browser chrome bar */}
              <div className="h-8 bg-gray-200 border-b border-gray-300 flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-4 bg-white rounded-sm border border-gray-300" />
              </div>
              {/* Content area */}
              <div
                className={cn(
                  'w-full h-[calc(100%-2rem)] overflow-y-auto bg-white',
                  plusJakartaSans.variable,
                  'font-[family-name:var(--font-display)]',
                )}
              >
                <TemplateRenderer invitation={filtered} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="flex justify-center py-8">
            <div className="w-full max-w-md mx-auto px-4">
              {publicUrl ? (
                <div className="space-y-6">
                  {/* QR code */}
                  {invitation.qrCodeUrl && (
                    <div className="flex flex-col items-center gap-3">
                      <QrCode className="size-5 text-gray-400" />
                      <img
                        src={invitation.qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48 rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Copyable URL */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Link thiep cuoi</p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm text-gray-800 truncate select-all">
                        {publicUrl}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopyUrl(publicUrl)}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Per-side copy links */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 min-w-0">
                      <span className="text-xs text-rose-500 font-medium shrink-0">
                        Nha trai
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-rose-800 select-all">
                        {publicUrl}?side=groom
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopyUrl(`${publicUrl}?side=groom`)}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 min-w-0">
                      <span className="text-xs text-rose-500 font-medium shrink-0">
                        Nha gai
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-rose-800 select-all">
                        {publicUrl}?side=bride
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopyUrl(`${publicUrl}?side=bride`)}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Share2 className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Xuat ban thiep de tao lien ket chia se
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
