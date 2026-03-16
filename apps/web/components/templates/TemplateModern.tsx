'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from './types'
import type { LoveStoryMilestone } from '@repo/types'
import { BankQrLock } from '@/app/w/[slug]/BankQrLock'
import { CopyAccountNumber } from './CopyAccountNumber'

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
  const message =
    invitation.invitationMessage ||
    'Tran trong kinh moi quy khach den du buoi tiec chung vui cung gia dinh chung toi.'
  const thankYou =
    invitation.thankYouText ||
    'Su hien dien cua quy khach la niem vinh hanh cua chung toi.'

  const hasGroomParents = invitation.groomFather || invitation.groomMother
  const hasBrideParents = invitation.brideFather || invitation.brideMother

  const hasGroomCeremony =
    invitation.groomCeremonyDate ||
    invitation.groomCeremonyTime ||
    invitation.groomVenueName ||
    invitation.groomVenueAddress
  const hasBrideCeremony =
    invitation.brideCeremonyDate ||
    invitation.brideCeremonyTime ||
    invitation.brideVenueName ||
    invitation.brideVenueAddress

  const loveStory: LoveStoryMilestone[] = invitation.loveStory ?? []

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

        {/* Parents names */}
        {(hasGroomParents || hasBrideParents) && (
          <div className="mb-10">
            {hasGroomParents && (
              <div className="mb-4">
                <p className="mb-1 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
                  Nha trai
                </p>
                <p className="text-sm text-gray-600">
                  {invitation.groomFather && <span>Ong: {invitation.groomFather}</span>}
                  {invitation.groomFather && invitation.groomMother && (
                    <span className="mx-2 text-rose-300/60">|</span>
                  )}
                  {invitation.groomMother && <span>Ba: {invitation.groomMother}</span>}
                </p>
              </div>
            )}
            {hasBrideParents && (
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
                  Nha gai
                </p>
                <p className="text-sm text-gray-600">
                  {invitation.brideFather && <span>Ong: {invitation.brideFather}</span>}
                  {invitation.brideFather && invitation.brideMother && (
                    <span className="mx-2 text-rose-300/60">|</span>
                  )}
                  {invitation.brideMother && <span>Ba: {invitation.brideMother}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Love story timeline */}
        {loveStory.length > 0 && (
          <div className="mb-10">
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Cau chuyen tinh yeu
            </p>
            <div className="relative mx-auto max-w-xs pl-6 text-left">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-rose-300/40" />
              {loveStory.map((milestone, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 h-[10px] w-[10px] rounded-full bg-rose-400" />
                  {milestone.date && (
                    <p className="text-[11px] text-rose-400/80">{milestone.date}</p>
                  )}
                  <p className="text-sm font-medium text-gray-700">{milestone.title}</p>
                  {milestone.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      {milestone.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rose-gold divider */}
        <div className="mx-auto mb-10 h-px w-24 bg-rose-300/50" />

        {/* Groom family ceremony - Le Nha Trai */}
        {hasGroomCeremony && (
          <div className="mb-10">
            <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Le Nha Trai
            </p>
            <p className="text-lg font-medium text-gray-700">
              {formatDate(invitation.groomCeremonyDate)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Luc {formatTime(invitation.groomCeremonyTime)}
            </p>
            {(invitation.groomVenueName || invitation.groomVenueAddress) && (
              <div className="mt-3">
                {invitation.groomVenueName && (
                  <p className="text-base font-medium text-gray-700">
                    {invitation.groomVenueName}
                  </p>
                )}
                {invitation.groomVenueAddress && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {invitation.groomVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-rose-400 underline underline-offset-2">
                Xem ban do
              </a>
            )}
          </div>
        )}

        {/* Bride family ceremony - Le Nha Gai */}
        {hasBrideCeremony && (
          <div className="mb-10">
            <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Le Nha Gai
            </p>
            <p className="text-lg font-medium text-gray-700">
              {formatDate(invitation.brideCeremonyDate)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Luc {formatTime(invitation.brideCeremonyTime)}
            </p>
            {(invitation.brideVenueName || invitation.brideVenueAddress) && (
              <div className="mt-3">
                {invitation.brideVenueName && (
                  <p className="text-base font-medium text-gray-700">
                    {invitation.brideVenueName}
                  </p>
                )}
                {invitation.brideVenueAddress && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {invitation.brideVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-rose-400 underline underline-offset-2">
                Xem ban do
              </a>
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

        {/* Photo gallery section */}
        {invitation.photoUrls.length > 0 && (
          <div className="mb-10">
            {/* Rose-gold divider */}
            <div className="mx-auto mb-6 h-px w-24 bg-rose-300/50" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Khoanh khac
            </p>
            <div className="space-y-3">
              {invitation.photoUrls.map((url, i) => (
                <img
                  key={url}
                  src={url}
                  alt={`Anh cuoi ${i + 1}`}
                  className="w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Bank QR "Mung cuoi" section */}
        {(invitation.bankQrUrl || invitation.brideBankQrUrl) && (
          <div className="mb-10">
            <div className="mx-auto mb-6 h-px w-24 bg-rose-300/50" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-rose-400/80">
              Mung cuoi
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {invitation.bankQrUrl && (
                <div className="flex-1 max-w-[280px] rounded-lg bg-white p-3 shadow-sm text-center">
                  <p className="mb-2 text-xs font-medium text-rose-400">Nha trai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-gray-500">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.bankName && <p className="mt-2 text-xs font-medium text-gray-700">{invitation.bankName}</p>}
                  {invitation.bankAccountHolder && <p className="text-xs text-gray-500">{invitation.bankAccountHolder}</p>}
                  {invitation.bankAccountNumber && <CopyAccountNumber accountNumber={invitation.bankAccountNumber} className="mt-2 text-sky-600" />}
                </div>
              )}
              {invitation.brideBankQrUrl && (
                <div className="flex-1 max-w-[280px] rounded-lg bg-white p-3 shadow-sm text-center">
                  <p className="mb-2 text-xs font-medium text-rose-400">Nha gai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-gray-500">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.brideBankName && <p className="mt-2 text-xs font-medium text-gray-700">{invitation.brideBankName}</p>}
                  {invitation.brideBankAccountHolder && <p className="text-xs text-gray-500">{invitation.brideBankAccountHolder}</p>}
                  {invitation.brideBankAccountNumber && <CopyAccountNumber accountNumber={invitation.brideBankAccountNumber} className="mt-2 text-sky-600" />}
                </div>
              )}
            </div>
          </div>
        )}

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
