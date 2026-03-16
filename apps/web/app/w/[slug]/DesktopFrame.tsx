'use client'

import type { TemplateId } from '@repo/types'

interface DesktopFrameProps {
  templateId: TemplateId
  children: React.ReactNode
}

const FRAME_COLORS: Record<TemplateId, { corner: string; vine: string; bg: string }> = {
  traditional: { corner: '#d4a843', vine: '#8B0000', bg: '#FFF8F0' },
  modern: { corner: '#B76E79', vine: '#FFB7C5', bg: '#FFF5F7' },
  minimalist: { corner: '#A0A0A0', vine: '#D5D0C4', bg: '#FAFAF8' },
}

// Botanical corner SVG -- soft watercolor-style leaf/vine curves
// Each corner is ~32x32, rotated for position. Total SVG < 2KB.
function CornerDecoration({ color, vineColor, position }: {
  color: string
  vineColor: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const rotations: Record<string, string> = {
    'top-left': 'rotate(0deg)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  }

  const positions: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }

  return (
    <div
      className={`absolute hidden md:block ${positions[position]}`}
      style={{ width: 48, height: 48, transform: rotations[position], zIndex: 5 }}
    >
      <svg
        viewBox="0 0 48 48"
        width="48"
        height="48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main leaf cluster */}
        <path
          d="M4 4 C4 4, 12 2, 20 6 C28 10, 24 18, 18 16 C12 14, 8 8, 4 4Z"
          fill={color}
          fillOpacity="0.5"
        />
        <path
          d="M6 6 C6 6, 14 5, 18 10 C22 15, 18 18, 14 15 C10 12, 8 8, 6 6Z"
          fill={color}
          fillOpacity="0.7"
        />
        {/* Vine curve extending along edges */}
        <path
          d="M2 8 C6 12, 10 20, 8 32"
          stroke={vineColor}
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 2 C12 6, 20 10, 32 8"
          stroke={vineColor}
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small accent leaf on vine */}
        <path
          d="M6 20 C8 18, 12 19, 10 22 C8 25, 5 23, 6 20Z"
          fill={vineColor}
          fillOpacity="0.35"
        />
        <path
          d="M20 6 C18 8, 19 12, 22 10 C25 8, 23 5, 20 6Z"
          fill={vineColor}
          fillOpacity="0.35"
        />
      </svg>
    </div>
  )
}

export function DesktopFrame({ templateId, children }: DesktopFrameProps) {
  const colors = FRAME_COLORS[templateId]

  return (
    <div
      className="min-h-screen flex items-start justify-center py-0 md:py-12"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Desktop background overlay */}
      <div
        className="fixed inset-0 hidden md:block"
        style={{ backgroundColor: colors.bg, zIndex: 0 }}
      />

      {/* Card container */}
      <div className="relative w-full max-w-full md:max-w-[480px]" style={{ zIndex: 1 }}>
        {/* Corner decorations -- desktop only */}
        <CornerDecoration color={colors.corner} vineColor={colors.vine} position="top-left" />
        <CornerDecoration color={colors.corner} vineColor={colors.vine} position="top-right" />
        <CornerDecoration color={colors.corner} vineColor={colors.vine} position="bottom-left" />
        <CornerDecoration color={colors.corner} vineColor={colors.vine} position="bottom-right" />

        {/* Vine border lines -- desktop only */}
        {/* Top border */}
        <div
          className="absolute top-0 left-[48px] right-[48px] hidden md:block"
          style={{
            height: 2,
            background: `linear-gradient(to right, transparent, ${colors.vine}66, ${colors.vine}33, ${colors.vine}66, transparent)`,
            zIndex: 5,
          }}
        />
        {/* Bottom border */}
        <div
          className="absolute bottom-0 left-[48px] right-[48px] hidden md:block"
          style={{
            height: 2,
            background: `linear-gradient(to right, transparent, ${colors.vine}66, ${colors.vine}33, ${colors.vine}66, transparent)`,
            zIndex: 5,
          }}
        />
        {/* Left border */}
        <div
          className="absolute left-0 top-[48px] bottom-[48px] hidden md:block"
          style={{
            width: 2,
            background: `linear-gradient(to bottom, transparent, ${colors.vine}66, ${colors.vine}33, ${colors.vine}66, transparent)`,
            zIndex: 5,
          }}
        />
        {/* Right border */}
        <div
          className="absolute right-0 top-[48px] bottom-[48px] hidden md:block"
          style={{
            width: 2,
            background: `linear-gradient(to bottom, transparent, ${colors.vine}66, ${colors.vine}33, ${colors.vine}66, transparent)`,
            zIndex: 5,
          }}
        />

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
