'use client'

import { useState, useEffect } from 'react'
import type { Invitation } from '@repo/types'
import { SharedTemplate } from '@/components/templates/SharedTemplate'
import { getTheme, buildThemeConfig, LEGACY_MAP, THEMES } from '@/components/templates/themes'
import type { ThemeConfig, ThemeId } from '@/components/templates/themes'
import { plusJakartaSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface EditorPreviewProps {
  invitation: Invitation
  mode?: 'phone' | 'desktop' | 'both'
}

export function EditorPreview({ invitation, mode = 'both' }: EditorPreviewProps) {
  const showPhone = mode === 'phone' || mode === 'both'

  // Resolve theme: built-in themes synchronously, custom themes via API
  const [resolvedTheme, setResolvedTheme] = useState<ThemeConfig>(getTheme(invitation.templateId))

  useEffect(() => {
    const builtIn = getTheme(invitation.templateId)
    const themeId = LEGACY_MAP[invitation.templateId] ?? invitation.templateId
    // If this is a known built-in theme, use it directly
    if (THEMES[themeId as ThemeId]) {
      setResolvedTheme(builtIn)
    } else {
      // Custom theme: fetch from public API endpoint
      fetch(`${API_URL}/themes/${invitation.templateId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((config) => {
          if (config) setResolvedTheme(buildThemeConfig(config))
        })
        .catch(() => {}) // Keep fallback on error
    }
  }, [invitation.templateId])

  return (
    <>
      {/* Preview Info Badge -- floating pill */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-sm border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-gray-600">Live Preview</span>
      </div>

      {/* Desktop layout (md and above) */}
      <div className="hidden md:flex items-center justify-center">
        {showPhone ? (
          /* Phone Device Frame -- Stitch exact specs */
          <div className="relative w-[375px] h-[750px] bg-white rounded-[40px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15),0_0_0_12px_#181113] overflow-hidden border-8 border-[#181113] shrink-0 transform scale-[0.85] md:scale-100 transition-transform duration-300">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#181113] rounded-b-2xl z-20" />
            {/* Screen */}
            <div
              className={cn(
                'w-full h-full overflow-y-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
                plusJakartaSans.variable,
                'font-[family-name:var(--font-display)]',
              )}
            >
              <SharedTemplate invitation={invitation} theme={resolvedTheme} />
            </div>
          </div>
        ) : (
          /* Desktop Device Frame */
          <div className="relative w-[680px] h-[480px] rounded-lg border-2 border-gray-300 bg-gray-100 shadow-lg overflow-hidden">
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
              <SharedTemplate invitation={invitation} theme={resolvedTheme} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile/tablet layout (below md): simple bordered preview */}
      <div className="md:hidden w-full px-4">
        <div
          className={cn(
            'border border-[#e6dbde] rounded-xl overflow-hidden bg-white shadow-sm',
            plusJakartaSans.variable,
            'font-[family-name:var(--font-display)]',
          )}
        >
          <SharedTemplate invitation={invitation} theme={resolvedTheme} />
        </div>
      </div>
    </>
  )
}
