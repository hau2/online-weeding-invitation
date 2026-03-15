'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from './types'
import { MapEmbed } from './MapEmbed'

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

export function TemplateMinimalist({ invitation, className }: TemplateProps) {
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
      {/* Cream background, pure typography */}
      <div className="bg-cream-50 px-10 py-16 text-center">
        {/* Generous top spacing with minimal label */}
        <p className="mb-12 text-[10px] uppercase tracking-[0.4em] text-gray-400">
          Thiep moi
        </p>

        {/* Couple names -- large, bold serif */}
        <div className="mb-14">
          <h2 className="font-heading text-4xl font-bold tracking-tight text-gray-800">
            {groomName}
          </h2>
          <p className="my-5 text-sm font-light text-gray-400">&amp;</p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-gray-800">
            {brideName}
          </h2>
        </div>

        {/* Hairline divider */}
        <div className="mx-auto mb-14 h-px w-10 bg-gray-300" />

        {/* Date and time */}
        <div className="mb-12">
          <p className="text-base font-light text-gray-600">
            {formatDate(invitation.weddingDate)}
          </p>
          <p className="mt-2 text-sm font-light text-gray-400">
            {formatTime(invitation.weddingTime)}
          </p>
        </div>

        {/* Venue */}
        {(venueName || venueAddress) && (
          <div className="mb-12">
            {venueName && (
              <p className="text-base font-medium text-gray-700">
                {venueName}
              </p>
            )}
            {venueAddress && (
              <p className="mt-1 text-sm font-light leading-relaxed text-gray-400">
                {venueAddress}
              </p>
            )}
            {invitation.venueMapUrl && (
              <MapEmbed url={invitation.venueMapUrl} linkClassName="text-gray-400" />
            )}
          </div>
        )}

        {/* Hairline divider */}
        <div className="mx-auto mb-14 h-px w-10 bg-gray-300" />

        {/* Invitation message */}
        <div className="mb-12">
          <p className="mx-auto max-w-[280px] text-sm font-light leading-loose text-gray-500">
            {message}
          </p>
        </div>

        {/* Photo gallery section */}
        {invitation.photoUrls.length > 0 && (
          <div className="mb-12">
            {/* Hairline divider */}
            <div className="mx-auto mb-8 h-px w-10 bg-gray-300" />
            <p className="mb-5 text-[10px] font-light uppercase tracking-[0.3em] text-gray-400">
              Khoanh khac
            </p>
            <div className="space-y-4">
              {invitation.photoUrls.map((url, i) => (
                <img
                  key={url}
                  src={url}
                  alt={`Anh cuoi ${i + 1}`}
                  className="w-full rounded object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Bank QR "Mung cuoi" section */}
        {(invitation.bankQrUrl || invitation.brideBankQrUrl) && (
          <div className="mb-12">
            <div className="mx-auto mb-8 h-px w-10 bg-gray-300" />
            <p className="mb-5 text-[10px] font-light uppercase tracking-[0.3em] text-gray-400">
              Mung cuoi
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {invitation.bankQrUrl && (
                <div className="flex-1 max-w-[200px] rounded border border-gray-200 p-3 text-center">
                  <p className="mb-2 text-xs font-light text-gray-500">Nha trai</p>
                  <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto max-w-[140px] rounded" loading="lazy" />
                  {invitation.bankName && <p className="mt-2 text-xs font-light text-gray-600">{invitation.bankName}</p>}
                  {invitation.bankAccountHolder && <p className="text-xs font-light text-gray-400">{invitation.bankAccountHolder}</p>}
                </div>
              )}
              {invitation.brideBankQrUrl && (
                <div className="flex-1 max-w-[200px] rounded border border-gray-200 p-3 text-center">
                  <p className="mb-2 text-xs font-light text-gray-500">Nha gai</p>
                  <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto max-w-[140px] rounded" loading="lazy" />
                  {invitation.brideBankName && <p className="mt-2 text-xs font-light text-gray-600">{invitation.brideBankName}</p>}
                  {invitation.brideBankAccountHolder && <p className="text-xs font-light text-gray-400">{invitation.brideBankAccountHolder}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thank you text */}
        <div className="mb-4">
          <p className="font-heading text-sm italic text-gray-400">
            {thankYou}
          </p>
        </div>
      </div>
    </div>
  )
}
