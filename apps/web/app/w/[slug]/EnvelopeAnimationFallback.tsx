'use client'

import { useState, useCallback } from 'react'
import type { TemplateId } from '@repo/types'

interface EnvelopeAnimationFallbackProps {
  templateId: TemplateId
  groomName: string
  brideName: string
  guestName?: string
  onOpen: () => void
}

const ENVELOPE_COLORS: Record<TemplateId, { body: string; flap: string; seal: string; text: string }> = {
  traditional: { body: '#8B0000', flap: '#A52A2A', seal: '#DAA520', text: '#FFD700' },
  modern: { body: '#FFFFFF', flap: '#F5F5F5', seal: '#B76E79', text: '#333333' },
  minimalist: { body: '#FFFDD0', flap: '#F5F5DC', seal: '#888888', text: '#333333' },
}

export function EnvelopeAnimationFallback({
  templateId,
  groomName,
  brideName,
  guestName,
  onOpen,
}: EnvelopeAnimationFallbackProps) {
  const [fading, setFading] = useState(false)
  const colors = ENVELOPE_COLORS[templateId]

  const handleTap = useCallback(() => {
    if (fading) return
    setFading(true)
    setTimeout(() => {
      onOpen()
    }, 500)
  }, [fading, onOpen])

  const handleSkip = useCallback(() => {
    onOpen()
  }, [onOpen])

  return (
    <div
      data-testid="envelope-fallback"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom, rgba(255,245,245,0.95), rgba(255,255,255,0.95))',
        opacity: fading ? 0 : 1,
        transition: 'opacity 500ms ease-out',
      }}
      onClick={handleTap}
      role="button"
      aria-label="Mo thiep cuoi"
    >
      {/* Envelope container */}
      <div
        className="relative cursor-pointer select-none"
        style={{ width: 280, height: 200 }}
      >
        {/* Envelope body */}
        <div
          data-testid="envelope-body"
          className="absolute inset-0 rounded-lg shadow-2xl"
          style={{
            backgroundColor: colors.body,
            backgroundImage:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* Envelope bottom fold (decorative triangle) */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 80,
            clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)',
            backgroundColor: colors.flap,
            opacity: 0.3,
          }}
        />

        {/* Envelope flap */}
        <div
          className="absolute left-0 right-0 top-0"
          style={{
            height: 100,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              backgroundColor: colors.flap,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          />
        </div>

        {/* Wax seal */}
        <div
          data-testid="wax-seal"
          className="absolute left-1/2 z-20 flex items-center justify-center rounded-full shadow-lg"
          style={{
            top: 70,
            width: 48,
            height: 48,
            marginLeft: -24,
            backgroundColor: colors.seal,
            border: `3px solid ${colors.seal}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
          }}
        >
          <span className="text-lg font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {templateId === 'traditional' ? '\u56CD' : '\u2665'}
          </span>
        </div>

        {/* Greeting text */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: 130, zIndex: 5 }}
        >
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: colors.text }}
          >
            Tran trong kinh moi
          </p>
          {guestName && (
            <p
              data-testid="guest-name"
              className="mt-1 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              {guestName}
            </p>
          )}
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleSkip()
        }}
        aria-label="Bo qua"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 min-h-12 min-w-12 rounded-full px-6 py-3 text-sm font-medium tracking-wide text-gray-400 transition-colors hover:text-gray-600"
      >
        Bo qua &gt;&gt;
      </button>
    </div>
  )
}
