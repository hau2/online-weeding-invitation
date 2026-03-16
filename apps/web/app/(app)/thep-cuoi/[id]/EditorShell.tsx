'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
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
      return <span className="text-xs text-gray-500 animate-pulse">Dang luu...</span>
    case 'saved':
      return <span className="text-xs text-green-600">Da luu</span>
    case 'error':
      return <span className="text-xs text-red-600">Loi luu</span>
    default:
      return null
  }
}

export function EditorShell({ invitation: initial }: { invitation: Invitation }) {
  const [invitation, setInvitation] = useState<Invitation>(initial)
  const [previewMode, setPreviewMode] = useState<'phone' | 'desktop'>('phone')
  const { save, status } = useAutoSave(initial.id)
  const { setOpen } = useSidebar()

  // Auto-collapse sidebar on mount
  useEffect(() => {
    setOpen(false)
  }, [setOpen])

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Editor topbar — Stitch design */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 bg-white shrink-0">
        {/* Left section */}
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="ml-3 text-sm font-semibold text-gray-800 truncate">
          Trinh chinh sua thiep
        </h1>
        <div className="ml-2">
          <SaveIndicator status={status} />
        </div>

        {/* Center section — Mobile/Desktop toggle */}
        <div className="flex-1 flex justify-center">
          <div className="hidden lg:inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => setPreviewMode('phone')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                previewMode === 'phone'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <Smartphone className="size-3.5 inline mr-1" />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                previewMode === 'desktop'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <Monitor className="size-3.5 inline mr-1" />
              Desktop
            </button>
          </div>
        </div>

        {/* Right section — Di luu (ghost) + Xem truoc (outlined) + Xuat ban (red filled) */}
        <div className="flex items-center gap-2">
          <UpgradeButton
            invitationId={invitation.id}
            plan={invitation.plan ?? 'free'}
            paymentStatus={invitation.paymentStatus ?? 'none'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => save({})}
            className="text-gray-600 hover:text-gray-800"
          >
            Di luu
          </Button>
          <Link href={`/thep-cuoi/${invitation.id}/preview`}>
            <Button variant="outline" size="sm">
              Xem truoc
            </Button>
          </Link>
          <PublishButton
            invitation={invitation}
            onPublished={handlePublished}
            onUnpublished={handleUnpublished}
          />
        </div>
      </div>

      {/* Responsive layout: side-by-side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Form panel */}
        <div className="flex-1 lg:max-w-md overflow-y-auto p-4 border-r border-gray-200">
          <EditorForm
            invitationId={invitation.id}
            values={invitation}
            onChange={handleChange}
            onAvatarUploaded={handleAvatarUploaded}
          />
        </div>

        {/* Preview panel */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col items-center gap-4">
          <EditorPreview invitation={invitation} mode={previewMode} />
        </div>
      </div>
    </div>
  )
}
