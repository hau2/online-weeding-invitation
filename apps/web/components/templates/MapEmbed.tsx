'use client'

/**
 * Converts any Google Maps URL to an embeddable iframe URL.
 * Uses the no-API-key approach: https://www.google.com/maps?q=...&output=embed
 */
function getEmbedUrl(url: string): string | null {
  if (!url.trim()) return null

  try {
    // Already an embed URL — use directly
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url

    // Extract @lat,lng from standard Google Maps URLs
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=15&output=embed`
    }

    // Extract place name from /maps/place/PLACE_NAME/ URLs
    if (url.includes('/maps/place/')) {
      const place = decodeURIComponent(url.split('/place/')[1]?.split('/')[0]?.replace(/\+/g, ' ') ?? '')
      if (place) {
        return `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`
      }
    }

    // Extract ?q= param
    const parsed = new URL(url)
    const q = parsed.searchParams.get('q')
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`
    }

    // Short URLs (goo.gl, maps.app.goo.gl) can't be parsed — fallback to link
    return null
  } catch {
    return null
  }
}

interface MapEmbedProps {
  url: string
  className?: string
  linkClassName?: string
}

export function MapEmbed({ url, className = '', linkClassName = '' }: MapEmbedProps) {
  if (!url.trim()) return null

  const embedUrl = getEmbedUrl(url)

  // If we can't embed, show a clickable link
  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 inline-block text-xs underline underline-offset-2 ${linkClassName}`}
      >
        Xem ban do
      </a>
    )
  }

  return (
    <div className={`mt-3 w-full overflow-hidden rounded-lg ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="180"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ban do dia diem"
      />
    </div>
  )
}
