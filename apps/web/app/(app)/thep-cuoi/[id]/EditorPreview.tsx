'use client'

import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates'

interface EditorPreviewProps {
  invitation: Invitation
}

export function EditorPreview({ invitation }: EditorPreviewProps) {
  return (
    <div className="w-full flex justify-center">
      {/* Phone mockup - desktop only */}
      <div className="hidden lg:block">
        <div className="relative mx-auto w-[320px] h-[640px] rounded-[2.5rem] border-4 border-gray-800 bg-gray-800 shadow-xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
          {/* Screen */}
          <div className="w-full h-full overflow-y-auto bg-white rounded-[2rem] pt-6">
            <TemplateRenderer invitation={invitation} />
          </div>
        </div>
      </div>

      {/* Mobile: simple bordered preview */}
      <div className="lg:hidden w-full">
        <div className="border border-rose-200 rounded-lg overflow-hidden bg-white">
          <TemplateRenderer invitation={invitation} />
        </div>
      </div>
    </div>
  )
}
