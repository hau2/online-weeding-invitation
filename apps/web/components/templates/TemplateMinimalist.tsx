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

export function TemplateMinimalist({ invitation, className }: TemplateProps) {
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

        {/* Parents names */}
        {(hasGroomParents || hasBrideParents) && (
          <div className="mb-14">
            {hasGroomParents && (
              <div className="mb-4">
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                  Nha trai
                </p>
                <p className="text-sm font-light text-gray-600">
                  {invitation.groomFather && <span>Ong: {invitation.groomFather}</span>}
                  {invitation.groomFather && invitation.groomMother && (
                    <span className="mx-2 text-gray-300">|</span>
                  )}
                  {invitation.groomMother && <span>Ba: {invitation.groomMother}</span>}
                </p>
              </div>
            )}
            {hasBrideParents && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                  Nha gai
                </p>
                <p className="text-sm font-light text-gray-600">
                  {invitation.brideFather && <span>Ong: {invitation.brideFather}</span>}
                  {invitation.brideFather && invitation.brideMother && (
                    <span className="mx-2 text-gray-300">|</span>
                  )}
                  {invitation.brideMother && <span>Ba: {invitation.brideMother}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Love story timeline */}
        {loveStory.length > 0 && (
          <div className="mb-14">
            <p className="mb-4 text-[10px] font-light uppercase tracking-[0.3em] text-gray-400">
              Cau chuyen tinh yeu
            </p>
            <div className="relative mx-auto max-w-xs pl-6 text-left">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-gray-300" />
              {loveStory.map((milestone, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 h-[10px] w-[10px] rounded-full bg-gray-400" />
                  {milestone.date && (
                    <p className="text-[10px] text-gray-400">{milestone.date}</p>
                  )}
                  <p className="text-sm font-medium text-gray-800">{milestone.title}</p>
                  {milestone.description && (
                    <p className="mt-0.5 text-xs font-light leading-relaxed text-gray-500">
                      {milestone.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hairline divider */}
        <div className="mx-auto mb-14 h-px w-10 bg-gray-300" />

        {/* Groom family ceremony - Le Nha Trai */}
        {hasGroomCeremony && (
          <div className="mb-12">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Le Nha Trai
            </p>
            <p className="text-base font-light text-gray-600">
              {formatDate(invitation.groomCeremonyDate)}
            </p>
            <p className="mt-2 text-sm font-light text-gray-400">
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
                  <p className="mt-1 text-sm font-light leading-relaxed text-gray-400">
                    {invitation.groomVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-gray-400 underline underline-offset-2">
                Xem ban do
              </a>
            )}
          </div>
        )}

        {/* Bride family ceremony - Le Nha Gai */}
        {hasBrideCeremony && (
          <div className="mb-12">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Le Nha Gai
            </p>
            <p className="text-base font-light text-gray-600">
              {formatDate(invitation.brideCeremonyDate)}
            </p>
            <p className="mt-2 text-sm font-light text-gray-400">
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
                  <p className="mt-1 text-sm font-light leading-relaxed text-gray-400">
                    {invitation.brideVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-gray-400 underline underline-offset-2">
                Xem ban do
              </a>
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
                <div className="flex-1 max-w-[280px] rounded border border-gray-200 p-3 text-center">
                  <p className="mb-2 text-xs font-light text-gray-500">Nha trai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-gray-500">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.bankName && <p className="mt-2 text-xs font-light text-gray-600">{invitation.bankName}</p>}
                  {invitation.bankAccountHolder && <p className="text-xs font-light text-gray-400">{invitation.bankAccountHolder}</p>}
                  {invitation.bankAccountNumber && <CopyAccountNumber accountNumber={invitation.bankAccountNumber} className="mt-2 text-gray-500" />}
                </div>
              )}
              {invitation.brideBankQrUrl && (
                <div className="flex-1 max-w-[280px] rounded border border-gray-200 p-3 text-center">
                  <p className="mb-2 text-xs font-light text-gray-500">Nha gai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-gray-500">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.brideBankName && <p className="mt-2 text-xs font-light text-gray-600">{invitation.brideBankName}</p>}
                  {invitation.brideBankAccountHolder && <p className="text-xs font-light text-gray-400">{invitation.brideBankAccountHolder}</p>}
                  {invitation.brideBankAccountNumber && <CopyAccountNumber accountNumber={invitation.brideBankAccountNumber} className="mt-2 text-gray-500" />}
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
