'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Heart, Monitor, Smartphone, Share2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates'
import { PublishButton } from '../PublishButton'
import { plusJakartaSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

type Tab = 'phone' | 'desktop'

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

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = invitation.slug ? `${origin}/w/${invitation.slug}` : null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f8f6f6]">
      {/* Top Navigation Bar — matches Stitch header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 bg-white px-6 py-3 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 text-[#181113]">
          <div className="flex items-center justify-center size-8 rounded-full bg-[#ec1349]/10 text-[#ec1349]">
            <Heart className="size-5" fill="currentColor" />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Xem truoc thiep</h2>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={`/thep-cuoi/${invitation.id}`}
            className="flex items-center gap-2 text-[#181113] text-sm font-medium hover:text-[#ec1349] transition-colors"
          >
            <ArrowLeft className="size-[18px]" />
            <span className="hidden sm:inline">Quay lai chinh sua</span>
          </Link>
          <PublishButton
            invitation={invitation}
            onPublished={handlePublished}
            onUnpublished={handleUnpublished}
          />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toolbar / Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 py-4 px-4 bg-[#f8f6f6] shrink-0 z-10">
          {/* View Toggle (Segmented Buttons) — matches Stitch */}
          <div className="flex h-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('phone')}
              className={cn(
                'flex cursor-pointer h-full items-center justify-center rounded-md px-4 text-sm font-medium transition-all gap-2',
                activeTab === 'phone'
                  ? 'bg-[#ec1349]/10 text-[#ec1349]'
                  : 'text-[#89616b] hover:text-[#181113]',
              )}
            >
              <Smartphone className="size-[18px]" />
              <span className="truncate">Dien thoai</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={cn(
                'flex cursor-pointer h-full items-center justify-center rounded-md px-4 text-sm font-medium transition-all gap-2',
                activeTab === 'desktop'
                  ? 'bg-[#ec1349]/10 text-[#ec1349]'
                  : 'text-[#89616b] hover:text-[#181113]',
              )}
            >
              <Monitor className="size-[18px]" />
              <span className="truncate">May tinh</span>
            </button>
          </div>

          {/* Share Button — matches Stitch */}
          {publicUrl ? (
            <button
              onClick={() => handleCopyUrl(publicUrl)}
              className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white border border-gray-200 text-[#181113] hover:bg-gray-50 gap-2 text-sm font-bold shadow-sm transition-colors"
            >
              <Share2 className="size-5" />
              <span className="truncate">Chia se lien ket</span>
            </button>
          ) : (
            <div className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-gray-200 text-[#89616b] gap-2 text-sm font-bold shadow-sm opacity-60 cursor-not-allowed">
              <Share2 className="size-5" />
              <span className="truncate">Chia se lien ket</span>
            </div>
          )}

          {/* Side toggle */}
          <div className="flex h-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setPreviewSide('groom')}
              className={cn(
                'flex cursor-pointer h-full items-center justify-center rounded-md px-4 text-sm font-medium transition-all',
                previewSide === 'groom'
                  ? 'bg-[#ec1349]/10 text-[#ec1349]'
                  : 'text-[#89616b] hover:text-[#181113]',
              )}
            >
              Nha trai
            </button>
            <button
              onClick={() => setPreviewSide('bride')}
              className={cn(
                'flex cursor-pointer h-full items-center justify-center rounded-md px-4 text-sm font-medium transition-all',
                previewSide === 'bride'
                  ? 'bg-[#ec1349]/10 text-[#ec1349]'
                  : 'text-[#89616b] hover:text-[#181113]',
              )}
            >
              Nha gai
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-hidden flex justify-center items-start pb-8 px-4 w-full">
          {activeTab === 'phone' && (
            /* Phone Container Simulator — matches Stitch exactly */
            <div className="relative w-full max-w-[400px] h-full bg-white rounded-[32px] shadow-2xl border-[8px] border-gray-800 overflow-hidden flex flex-col ring-1 ring-black/5">
              {/* Status Bar Mockup */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-black/20 z-20 flex justify-between items-center px-6 text-[10px] text-white font-medium backdrop-blur-sm">
                <span>9:41</span>
                <div className="flex gap-1 items-center">
                  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h2V10H2v12zm4 0h2V7H6v15zm4 0h2V4h-2v18zm4 0h2V1h-2v21z"/></svg>
                  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                </div>
              </div>
              {/* Scrollable Content Area */}
              <div
                className={cn(
                  'flex-1 overflow-y-auto bg-white w-full relative',
                  plusJakartaSans.variable,
                  'font-[family-name:var(--font-display)]',
                )}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.1) transparent',
                }}
              >
                <TemplateRenderer invitation={filtered} />
              </div>
              {/* Home Indicator Mockup */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-center pb-2 z-20 pointer-events-none">
                <div className="w-32 h-1 bg-black/20 rounded-full backdrop-blur-md" />
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="relative w-[680px] max-w-[90vw] h-full rounded-lg border-2 border-gray-300 bg-gray-100 shadow-lg overflow-hidden flex flex-col">
              {/* Browser chrome bar */}
              <div className="h-8 bg-gray-200 border-b border-gray-300 flex items-center px-3 gap-2 shrink-0">
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
                  'flex-1 overflow-y-auto bg-white',
                  plusJakartaSans.variable,
                  'font-[family-name:var(--font-display)]',
                )}
              >
                <TemplateRenderer invitation={filtered} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
