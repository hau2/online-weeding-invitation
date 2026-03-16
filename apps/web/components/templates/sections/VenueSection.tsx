'use client'

import { MapPin, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

export function VenueSection({ invitation, theme }: SectionProps) {
  const hasGroomVenue = invitation.groomVenueName || invitation.groomVenueAddress
  const hasBrideVenue = invitation.brideVenueName || invitation.brideVenueAddress

  // Hide section entirely if no venue data exists
  if (!hasGroomVenue && !hasBrideVenue) return null

  const venues = []
  if (hasGroomVenue) {
    venues.push({
      label: 'Nha trai',
      name: invitation.groomVenueName,
      address: invitation.groomVenueAddress,
      date: invitation.groomCeremonyDate,
      time: invitation.groomCeremonyTime,
    })
  }
  if (hasBrideVenue) {
    venues.push({
      label: 'Nha gai',
      name: invitation.brideVenueName,
      address: invitation.brideVenueAddress,
      date: invitation.brideCeremonyDate,
      time: invitation.brideCeremonyTime,
    })
  }

  return (
    <section id="map" className="w-full max-w-[1200px] mx-auto px-4 py-16 md:px-10">
      <div
        className={cn(
          'overflow-hidden bg-white shadow-xl',
          theme.cardBorderRadius
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Venue info */}
          <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
            <span
              className="mb-2 text-sm font-bold uppercase tracking-widest"
              style={{ color: theme.primaryColor }}
            >
              Dia diem to chuc
            </span>

            {venues.map((venue, i) => (
              <div key={i} className={cn(i > 0 && 'mt-8 pt-8 border-t border-neutral-100')}>
                {venues.length > 1 && (
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.mutedTextColor }}>
                    {venue.label}
                  </p>
                )}
                <h2
                  className="mb-2 text-2xl md:text-3xl font-bold"
                  style={{ color: theme.textColor }}
                >
                  {venue.name || 'Chua co dia diem'}
                </h2>
                {venue.address && (
                  <p className="mb-4" style={{ color: theme.mutedTextColor }}>
                    {venue.address}
                  </p>
                )}
                {venue.date && (
                  <p className="text-sm" style={{ color: theme.mutedTextColor }}>
                    {new Intl.DateTimeFormat('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date(venue.date))}
                    {venue.time && ` - ${venue.time}`}
                  </p>
                )}
              </div>
            ))}

            {invitation.venueMapUrl && (
              <div className="mt-6">
                <a
                  href={invitation.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex w-fit items-center gap-3 px-6 py-3 font-bold text-white transition-colors hover:opacity-90',
                    theme.borderRadius
                  )}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Navigation className="size-5" />
                  Chi duong
                </a>
              </div>
            )}
          </div>

          {/* Map placeholder */}
          <div
            className={cn(
              'relative min-h-[300px] flex-1 bg-neutral-200'
            )}
          >
            <div className="absolute inset-0 bg-neutral-100" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg animate-bounce"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <MapPin className="size-7" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
