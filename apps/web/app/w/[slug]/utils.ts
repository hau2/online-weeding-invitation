/**
 * Parse and sanitize guest name from URL search params.
 * Used by EnvelopeAnimation and InvitationShell for personalized greetings.
 *
 * @param searchParams - URLSearchParams from the URL
 * @returns Sanitized guest name or null if not present/empty
 */
export function parseGuestName(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get('to')
  if (!raw) return null

  // Strip HTML tags to prevent XSS
  const stripped = raw.replace(/<[^>]*>/g, '')

  // Trim whitespace
  const trimmed = stripped.trim()

  // Return null if empty after sanitization
  if (!trimmed) return null

  // Truncate to 50 characters
  return trimmed.slice(0, 50)
}
