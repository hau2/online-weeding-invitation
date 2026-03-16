'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import { useAutoSave } from './useAutoSave'
import type { SaveStatus } from './useAutoSave'
import { EditorForm } from './EditorForm'
import { EditorPreview } from './EditorPreview'
import { PublishButton } from './PublishButton'
import { UpgradeButton } from './UpgradeButton'

function SaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <span className="text-[#89616b] text-sm font-medium animate-pulse hidden sm:block">Dang luu...</span>
    case 'saved':
      return <span className="text-[#89616b] text-sm font-medium hidden sm:block">Da luu</span>
    case 'error':
      return <span className="text-red-600 text-sm font-medium hidden sm:block">Loi luu</span>
    default:
      return null
  }
}

export function EditorShell({ invitation: initial }: { invitation: Invitation }) {
  const [invitation, setInvitation] = useState<Invitation>(initial)
  const [previewMode, setPreviewMode] = useState<'phone' | 'desktop'>('phone')
  const { save, status } = useAutoSave(initial.id)

  const handleChange = useCallback(
    (changes: Partial<Invitation>) => {
      setInvitation((prev) => ({ ...prev, ...changes }))
      save(changes)
    },
    [save],
  )

  const handlePublished = useCallback((updated: Invitation) => {
    setInvitation(updated)
  }, [])

  const handleUnpublished = useCallback((updated: Invitation) => {
    setInvitation(updated)
  }, [])

  const handleAvatarUploaded = useCallback(
    (field: 'groomAvatarUrl' | 'brideAvatarUrl', url: string) => {
      setInvitation((prev) => ({ ...prev, [field]: url }))
    },
    [],
  )

  return (
    <div className="flex flex-col h-[calc(100svh-3rem)] md:h-svh -m-8 bg-white overflow-hidden">
      {/* Editor topbar — Stitch design */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e6dbde] bg-white px-4 md:px-6 shrink-0 z-20 shadow-sm h-14">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center justify-center size-9 rounded-lg text-[#181113] hover:text-[#ec1349] hover:bg-[#f4f0f1] transition-colors shrink-0">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="h-5 w-px bg-[#e6dbde] shrink-0" />
          <h2 className="text-[#181113] text-base font-bold leading-tight tracking-[-0.015em] truncate">
            Trinh chinh sua thiep
          </h2>
        </div>

        {/* Center: Device Toggle */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-[#f4f0f1] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setPreviewMode('phone')}
            className={cn(
              'cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md transition-all',
              previewMode === 'phone'
                ? 'bg-white shadow-sm text-[#ec1349]'
                : 'text-[#89616b] hover:text-[#181113]',
            )}
          >
            <Smartphone className="size-[18px]" />
            <span className={cn('text-sm', previewMode === 'phone' ? 'font-semibold' : 'font-medium')}>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={cn(
              'cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md transition-all',
              previewMode === 'desktop'
                ? 'bg-white shadow-sm text-[#ec1349]'
                : 'text-[#89616b] hover:text-[#181113]',
            )}
          >
            <Monitor className="size-[18px]" />
            <span className={cn('text-sm', previewMode === 'desktop' ? 'font-semibold' : 'font-medium')}>Desktop</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <SaveIndicator status={status} />
          <div className="flex items-center gap-2">
            <UpgradeButton
              invitationId={invitation.id}
              plan={invitation.plan ?? 'free'}
              paymentStatus={invitation.paymentStatus ?? 'none'}
            />
            <Link href={`/thep-cuoi/${invitation.id}/preview`}>
              <button
                type="button"
                className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white border border-[#e6dbde] text-[#181113] hover:bg-gray-50 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                <span className="truncate">Xem truoc</span>
              </button>
            </Link>
            <PublishButton
              invitation={invitation}
              onPublished={handlePublished}
              onUnpublished={handleUnpublished}
            />
          </div>
        </div>
      </header>

      {/* Main Content: Split View */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Column: Form Editor */}
        <aside className="w-full md:w-[480px] lg:w-[520px] bg-white border-r border-[#e6dbde] flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <EditorForm
              invitationId={invitation.id}
              values={invitation}
              onChange={handleChange}
              onAvatarUploaded={handleAvatarUploaded}
            />
          </div>
        </aside>

        {/* Right Column: Live Preview */}
        <section className="flex-1 bg-[#F0F2F5] relative flex flex-col items-center justify-center p-8 overflow-hidden">
          <EditorPreview invitation={invitation} mode={previewMode} />
        </section>
      </main>
    </div>
  )
}
