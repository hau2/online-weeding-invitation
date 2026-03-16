'use client'

/**
 * Diagonal watermark overlay for free-tier invitations.
 * Renders "ThiepCuoiOnline.vn" text repeated across the entire viewport
 * in a diagonal pattern. Uses DOM text elements (not CSS background-image
 * or SVG data URI) to resist simple CSS blocking.
 *
 * - fixed inset-0 z-50 pointer-events-none: covers viewport, click-through
 * - rotate(-30deg) + scale(1.5): diagonal coverage including corners
 * - select-none + !important styles: resists casual removal
 */
export function Watermark() {
  // Generate enough rows and columns to cover viewport after rotation
  const rows = 20
  const cols = 6
  const text = 'ThiepCuoiOnline.vn'

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden pointer-events-none select-none"
      style={{
        userSelect: 'none' as const,
        pointerEvents: 'none' as const,
        zIndex: 50,
      }}
      aria-hidden="true"
      data-watermark="true"
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          transform: 'rotate(-30deg) scale(1.5)',
          transformOrigin: 'center center',
        }}
      >
        {Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex whitespace-nowrap"
            style={{
              marginTop: rowIdx === 0 ? '-20vh' : undefined,
              gap: '3rem',
            }}
          >
            {Array.from({ length: cols }, (_, colIdx) => (
              <span
                key={colIdx}
                className="text-sm tracking-widest"
                style={{
                  color: 'rgba(150, 150, 150, 0.13)',
                  fontSize: '14px',
                  letterSpacing: '0.15em',
                  fontWeight: 500,
                  lineHeight: '3.2rem',
                  userSelect: 'none',
                }}
              >
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
