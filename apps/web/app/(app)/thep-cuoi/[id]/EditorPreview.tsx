'use client'

import type { Invitation } from '@repo/types'
import { TemplateRenderer } from '@/components/templates'
import { plusJakartaSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

interface EditorPreviewProps {
  invitation: Invitation
}

export function EditorPreview({ invitation }: EditorPreviewProps) {
  return (
    <div className="w-full">
      {/* Desktop layout (lg and above): side-by-side phone + desktop mockups */}
      <div className="hidden lg:flex items-start gap-8 justify-center">
        {/* Phone mockup — left side */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Mobile
          </span>
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
              <TemplateRenderer invitation={invitation} />
            </div>
          </div>
        </div>

        {/* Desktop mockup — right side */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Desktop
          </span>
          <div className="relative w-[580px] h-[400px] rounded-lg border-2 border-gray-300 bg-gray-100 shadow-lg overflow-hidden">
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
              <TemplateRenderer invitation={invitation} />
            </div>
          </div>
        </div>
      </div>

      {/* Tablet/mobile layout (below lg): simple bordered preview */}
      <div className="lg:hidden w-full">
        <div
          className={cn(
            'border border-rose-200 rounded-lg overflow-hidden bg-white',
            plusJakartaSans.variable,
            'font-[family-name:var(--font-display)]',
          )}
        >
          <TemplateRenderer invitation={invitation} />
        </div>
      </div>
    </div>
  )
}
