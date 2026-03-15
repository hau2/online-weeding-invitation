'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import type { Invitation } from '@repo/types'
import { useAutoSave } from './useAutoSave'
import type { SaveStatus } from './useAutoSave'
import { EditorForm } from './EditorForm'
import { EditorPreview } from './EditorPreview'
import { TemplateSelector } from './TemplateSelector'
import { PublishButton } from './PublishButton'
import { FullPreviewDialog } from './FullPreviewDialog'

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
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [previewSide, setPreviewSide] = useState<'groom' | 'bride'>('groom')
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

  const title =
    invitation.groomName && invitation.brideName
      ? `${invitation.groomName} & ${invitation.brideName}`
      : 'Thiep cuoi moi'

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Editor topbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-rose-100 bg-white shrink-0">
        <Link
          href="/dashboard"
          className="text-rose-400 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-sm font-medium text-rose-800 truncate">{title}</h1>
        <SaveIndicator status={status} />
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => { setPreviewSide('groom'); setShowFullPreview(true) }}
        >
          <Eye className="size-3.5" />
          Nha trai
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => { setPreviewSide('bride'); setShowFullPreview(true) }}
        >
          <Eye className="size-3.5" />
          Nha gai
        </Button>
        <PublishButton
          invitation={invitation}
          onPublished={handlePublished}
          onUnpublished={handleUnpublished}
        />
      </div>

      <FullPreviewDialog
        invitation={invitation}
        side={previewSide}
        open={showFullPreview}
        onOpenChange={setShowFullPreview}
      />

      {/* Responsive layout: side-by-side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Form panel */}
        <div className="flex-1 lg:max-w-md overflow-y-auto p-4 border-r border-rose-100">
          <EditorForm invitationId={invitation.id} values={invitation} onChange={handleChange} />
        </div>

        {/* Preview panel */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col items-center gap-4">
          <TemplateSelector
            currentTemplate={invitation.templateId}
            onSelect={(templateId) => handleChange({ templateId })}
          />
          <EditorPreview invitation={invitation} />
        </div>
      </div>
    </div>
  )
}
