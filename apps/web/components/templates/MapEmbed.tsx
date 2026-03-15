'use client'

/**
 * Converts a Google Maps share URL to an embeddable URL.
 * Supports:
 * - https://maps.google.com/... → extracts coords for embed
 * - https://www.google.com/maps/place/... → converts to embed
 * - https://goo.gl/maps/... → passed through as link (can't embed short URLs)
 * - https://maps.app.goo.gl/... → passed through as link
 */
function getEmbedUrl(url: string): string | null {
  if (!url.trim()) return null

  try {
    const parsed = new URL(url.trim())

    // Already an embed URL
    if (url.includes('/maps/embed')) return url

    // Standard Google Maps URL with @lat,lng
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${atMatch[2]}!3d${atMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1`
    }

    // Google Maps place URL — use the query-based embed
    if (parsed.hostname.includes('google') && url.includes('/maps/place/')) {
      const place = decodeURIComponent(url.split('/place/')[1]?.split('/')[0] ?? '')
      if (place) {
        return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(place)}`
      }
    }

    // Fallback: use the URL as a search query embed
    if (parsed.hostname.includes('google') && url.includes('/maps')) {
      const q = parsed.searchParams.get('q')
      if (q) {
        return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(q)}`
      }
    }

    return null
  } catch {
    return null
  }
}

interface MapEmbedProps {
  url: string
  className?: string
}

export function MapEmbed({ url, className = '' }: MapEmbedProps) {
  const embedUrl = getEmbedUrl(url)

  // If we can't create an embed, show a clickable link instead
  if (!embedUrl) {
    if (!url.trim()) return null
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-center text-sm underline ${className}`}
      >
        Xem ban do
      </a>
    )
  }

  return (
    <div className={`w-full overflow-hidden rounded-lg ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="200"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ban do dia diem"
      />
    </div>
  )
}
