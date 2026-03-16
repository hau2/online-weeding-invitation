'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from './types'
import type { LoveStoryMilestone } from '@repo/types'
import { BankQrLock } from '@/app/w/[slug]/BankQrLock'

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

export function TemplateTraditional({ invitation, className }: TemplateProps) {
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
      {/* Background with deep red/burgundy gradient */}
      <div className="bg-gradient-to-b from-[#5c0a0a] via-[#7a1212] to-[#5c0a0a] px-8 py-12 text-center">
        {/* Top ornamental border */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a843]" />
          <span className="text-2xl text-[#d4a843]">&#10022;</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a843]" />
        </div>

        {/* Header text */}
        <p className="mb-2 text-xs font-light uppercase tracking-[0.3em] text-[#d4a843]/80">
          Thiep moi
        </p>

        {/* Double happiness character */}
        <div className="mb-6 text-5xl leading-none text-[#d4a843]/30">
          &#22205;
        </div>

        {/* Couple names */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-semibold italic text-[#f0d68a]">
            {groomName}
          </h2>
          <p className="my-3 font-script text-3xl text-[#d4a843]">&amp;</p>
          <h2 className="font-heading text-3xl font-semibold italic text-[#f0d68a]">
            {brideName}
          </h2>
        </div>

        {/* Parents names */}
        {(hasGroomParents || hasBrideParents) && (
          <div className="mb-8">
            {hasGroomParents && (
              <div className="mb-4">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
                  Nha trai
                </p>
                <p className="text-sm text-[#f0d68a]/80">
                  {invitation.groomFather && <span>Ong: {invitation.groomFather}</span>}
                  {invitation.groomFather && invitation.groomMother && (
                    <span className="mx-2 text-[#d4a843]/40">|</span>
                  )}
                  {invitation.groomMother && <span>Ba: {invitation.groomMother}</span>}
                </p>
              </div>
            )}
            {hasBrideParents && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
                  Nha gai
                </p>
                <p className="text-sm text-[#f0d68a]/80">
                  {invitation.brideFather && <span>Ong: {invitation.brideFather}</span>}
                  {invitation.brideFather && invitation.brideMother && (
                    <span className="mx-2 text-[#d4a843]/40">|</span>
                  )}
                  {invitation.brideMother && <span>Ba: {invitation.brideMother}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Love story timeline */}
        {loveStory.length > 0 && (
          <div className="mb-8">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
              Cau chuyen tinh yeu
            </p>
            <div className="relative mx-auto max-w-xs pl-6 text-left">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-[#d4a843]/40" />
              {loveStory.map((milestone, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 h-[10px] w-[10px] rounded-full bg-[#d4a843]" />
                  {milestone.date && (
                    <p className="text-[11px] text-[#d4a843]/60">{milestone.date}</p>
                  )}
                  <p className="text-sm font-medium text-[#f0d68a]">{milestone.title}</p>
                  {milestone.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-[#d4a843]/70">
                      {milestone.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ornamental divider */}
        <div className="mx-auto mb-8 flex w-48 items-center justify-center gap-2">
          <div className="h-px flex-1 bg-[#d4a843]/40" />
          <span className="text-sm text-[#d4a843]/60">&#9830;</span>
          <div className="h-px flex-1 bg-[#d4a843]/40" />
        </div>

        {/* Groom family ceremony - Le Nha Trai */}
        {hasGroomCeremony && (
          <div className="mb-8">
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
              Le Nha Trai
            </p>
            <p className="font-heading text-lg font-medium text-[#f0d68a]">
              {formatDate(invitation.groomCeremonyDate)}
            </p>
            <p className="mt-2 text-sm text-[#d4a843]/80">
              Luc {formatTime(invitation.groomCeremonyTime)}
            </p>
            {(invitation.groomVenueName || invitation.groomVenueAddress) && (
              <div className="mt-3">
                {invitation.groomVenueName && (
                  <p className="font-heading text-base font-medium text-[#f0d68a]">
                    {invitation.groomVenueName}
                  </p>
                )}
                {invitation.groomVenueAddress && (
                  <p className="mt-1 text-sm leading-relaxed text-[#d4a843]/70">
                    {invitation.groomVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#d4a843] underline underline-offset-2">
                Xem ban do
              </a>
            )}
          </div>
        )}

        {/* Bride family ceremony - Le Nha Gai */}
        {hasBrideCeremony && (
          <div className="mb-8">
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
              Le Nha Gai
            </p>
            <p className="font-heading text-lg font-medium text-[#f0d68a]">
              {formatDate(invitation.brideCeremonyDate)}
            </p>
            <p className="mt-2 text-sm text-[#d4a843]/80">
              Luc {formatTime(invitation.brideCeremonyTime)}
            </p>
            {(invitation.brideVenueName || invitation.brideVenueAddress) && (
              <div className="mt-3">
                {invitation.brideVenueName && (
                  <p className="font-heading text-base font-medium text-[#f0d68a]">
                    {invitation.brideVenueName}
                  </p>
                )}
                {invitation.brideVenueAddress && (
                  <p className="mt-1 text-sm leading-relaxed text-[#d4a843]/70">
                    {invitation.brideVenueAddress}
                  </p>
                )}
              </div>
            )}
            {invitation.venueMapUrl && (
              <a href={invitation.venueMapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#d4a843] underline underline-offset-2">
                Xem ban do
              </a>
            )}
          </div>
        )}

        {/* Ornamental divider */}
        <div className="mx-auto mb-8 flex w-32 items-center justify-center gap-2">
          <div className="h-px flex-1 bg-[#d4a843]/30" />
          <span className="text-xs text-[#d4a843]/40">&#10022;</span>
          <div className="h-px flex-1 bg-[#d4a843]/30" />
        </div>

        {/* Invitation message */}
        <div className="mb-8">
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#f0d68a]/80">
            {message}
          </p>
        </div>

        {/* Photo gallery section */}
        {invitation.photoUrls.length > 0 && (
          <div className="mb-8">
            {/* Ornamental divider */}
            <div className="mx-auto mb-6 flex w-32 items-center justify-center gap-2">
              <div className="h-px flex-1 bg-[#d4a843]/30" />
              <span className="text-xs text-[#d4a843]/40">&#10022;</span>
              <div className="h-px flex-1 bg-[#d4a843]/30" />
            </div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
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
          <div className="mb-8">
            <div className="mx-auto mb-6 flex w-32 items-center justify-center gap-2">
              <div className="h-px flex-1 bg-[#d4a843]/30" />
              <span className="text-xs text-[#d4a843]/40">&#10022;</span>
              <div className="h-px flex-1 bg-[#d4a843]/30" />
            </div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#d4a843]/60">
              Mung cuoi
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {invitation.bankQrUrl && (
                <div className="flex-1 max-w-[280px] rounded-lg border border-[#d4a843]/30 bg-[#5c0a0a]/80 p-3 text-center">
                  <p className="mb-2 text-xs font-medium text-[#d4a843]/80">Nha trai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.bankQrUrl} alt="QR Nha trai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-[#d4a843]/60">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.bankName && <p className="mt-2 text-xs text-[#f0d68a]">{invitation.bankName}</p>}
                  {invitation.bankAccountHolder && <p className="text-xs text-[#d4a843]/80">{invitation.bankAccountHolder}</p>}
                </div>
              )}
              {invitation.brideBankQrUrl && (
                <div className="flex-1 max-w-[280px] rounded-lg border border-[#d4a843]/30 bg-[#5c0a0a]/80 p-3 text-center">
                  <p className="mb-2 text-xs font-medium text-[#d4a843]/80">Nha gai</p>
                  {(invitation.plan ?? 'free') === 'free' ? (
                    <BankQrLock>
                      <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                    </BankQrLock>
                  ) : (
                    <img src={invitation.brideBankQrUrl} alt="QR Nha gai" className="mx-auto w-full max-w-[240px] rounded-lg" loading="lazy" />
                  )}
                  <p className="mt-2 text-center text-sm text-[#d4a843]/60">Mo ung dung ngan hang va quet ma QR</p>
                  {invitation.brideBankName && <p className="mt-2 text-xs text-[#f0d68a]">{invitation.brideBankName}</p>}
                  {invitation.brideBankAccountHolder && <p className="text-xs text-[#d4a843]/80">{invitation.brideBankAccountHolder}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thank you text */}
        <div className="mb-6">
          <p className="font-script text-lg text-[#d4a843]/70">{thankYou}</p>
        </div>

        {/* Bottom ornamental border */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a843]" />
          <span className="text-2xl text-[#d4a843]">&#10022;</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a843]" />
        </div>
      </div>
    </div>
  )
}
