'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from './types'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Chua chon ngay'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(date)
  } catch {
    return dateStr
  }
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return 'Chua chon gio'
  return timeStr
}

export function TemplateModern({ invitation, className }: TemplateProps) {
  const groomName = invitation.groomName || 'Chu re'
  const brideName = invitation.brideName || 'Co dau'
  const venueName = invitation.venueName || ''
  const venueAddress = invitation.venueAddress || ''
  const message =
    invitation.invitationMessage ||
    'Tran trong kinh moi quy khach den du buoi tiec chung vui cung gia dinh chung toi.'
  const thankYou =
    invitation.thankYouText ||
    'Su hien dien cua quy khach la niem vinh hanh cua chung toi.'

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[420px] overflow-hidden rounded-lg',
        className
      )}
    >
      {/* Clean white card with subtle shadow */}
      <div className="bg-rose-50 px-8 py-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* Thin rose-gold top line */}
        <div className="mx-auto mb-10 h-px w-16 bg-rose-300" />

        {/* Header label */}
        <p className="mb-8 text-[11px] uppercase tracking-[0.35em] text-rose-400">
          We&apos;re getting married
        </p>

        {/* Couple names */}
        <div className="mb-10">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-gray-800">
            {groomName}
          </h2>
          <div className="my-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-rose-300/60" />
            <span className="font-script text-2xl text-rose-400">&amp;</span>
            <div className="h-px w-12 bg-rose-300/60" />
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-gray-800">
            {brideName}
          </h2>
        </div>

        {/* Rose-gold divider */}
        <div className="mx-auto mb-10 h-px w-24 bg-rose-300/50" />

        {/* Date and time */}
        <div className="mb-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
            Ngay cuoi
          </p>
          <p className="text-lg font-medium text-gray-700">
            {formatDate(invitation.weddingDate)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {formatTime(invitation.weddingTime)}
          </p>
        </div>

        {/* Venue */}
        {(venueName || venueAddress) && (
          <div className="mb-10">
            <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Dia diem
            </p>
            {venueName && (
              <p className="text-base font-medium text-gray-700">
                {venueName}
              </p>
            )}
            {venueAddress && (
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {venueAddress}
              </p>
            )}
          </div>
        )}

        {/* Rose-gold divider */}
        <div className="mx-auto mb-10 h-px w-24 bg-rose-300/50" />

        {/* Invitation message */}
        <div className="mb-10">
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-600">
            {message}
          </p>
        </div>

        {/* Thank you text */}
        <div className="mb-10">
          <p className="font-heading text-base italic text-rose-400/80">
            {thankYou}
          </p>
        </div>

        {/* Thin rose-gold bottom line */}
        <div className="mx-auto h-px w-16 bg-rose-300" />
      </div>
    </div>
  )
}
