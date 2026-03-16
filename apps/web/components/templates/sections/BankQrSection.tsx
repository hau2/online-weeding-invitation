'use client'

import Image from 'next/image'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'
import { BankQrLock } from '@/app/w/[slug]/BankQrLock'
import { CopyAccountNumber } from '../CopyAccountNumber'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

interface BankCardProps {
  label: string
  bankName: string
  bankQrUrl: string | null
  accountHolder: string
  accountNumber: string
  theme: ThemeConfig
  isFreeTier: boolean
}

function BankCard({
  label,
  bankName,
  bankQrUrl,
  accountHolder,
  accountNumber,
  theme,
  isFreeTier,
}: BankCardProps) {
  const qrImage = bankQrUrl ? (
    <div className="mb-6 h-48 w-48 rounded-lg bg-white p-2 shadow-inner border border-neutral-100 relative">
      <Image
        src={bankQrUrl}
        alt={`QR ${label}`}
        fill
        className="object-contain p-2"
        loading="lazy"
        sizes="192px"
      />
    </div>
  ) : null

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-white p-6 shadow-2xl ring-1 ring-neutral-100',
        theme.cardBorderRadius
      )}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full"
        style={{ backgroundColor: theme.primaryColor + '0D' }}
      />
      <div
        className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full"
        style={{ backgroundColor: theme.primaryColor + '0D' }}
      />

      <div className="relative flex flex-col items-center">
        <h3
          className="mb-4 text-xl font-bold uppercase"
          style={{ color: theme.primaryColor }}
        >
          {label}
        </h3>
        {bankName && (
          <div className="mb-2 text-sm font-medium uppercase" style={{ color: theme.mutedTextColor }}>
            {bankName}
          </div>
        )}

        {/* QR image - wrapped in BankQrLock for free tier */}
        {qrImage && (isFreeTier ? <BankQrLock>{qrImage}</BankQrLock> : qrImage)}

        {/* Account details */}
        <div className="w-full space-y-3 rounded-lg bg-neutral-50 p-4 mt-4">
          {accountHolder && (
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: theme.mutedTextColor }}>
                Chu tai khoan:
              </span>
              <span className="font-bold uppercase" style={{ color: theme.textColor }}>
                {accountHolder}
              </span>
            </div>
          )}
          {accountNumber && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: theme.mutedTextColor }}>
                So tai khoan:
              </span>
              <CopyAccountNumber
                accountNumber={accountNumber}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BankQrSection({ invitation, theme }: SectionProps) {
  const hasGroom = invitation.bankQrUrl || invitation.bankAccountNumber
  const hasBride = invitation.brideBankQrUrl || invitation.brideBankAccountNumber

  if (!hasGroom && !hasBride) return null

  const isFreeTier = (invitation.plan ?? 'free') === 'free'

  return (
    <section id="gift" className="w-full max-w-[960px] mx-auto px-4 py-16">
      <div className="flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center max-w-lg">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: theme.primaryColor + '15' }}
          >
            <Heart className="size-7" style={{ color: theme.primaryColor }} fill="currentColor" />
          </div>
          <h2
            className={cn('text-3xl', theme.headingWeight)}
            style={{ color: theme.textColor }}
          >
            Mung Cuoi
          </h2>
          <p className="mt-3 leading-relaxed" style={{ color: theme.mutedTextColor }}>
            Su hien dien cua quy khach la mon qua tran quy nhat doi voi chung toi.
          </p>
        </div>

        {/* Bank cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {hasGroom && (
            <BankCard
              label="Mung Cuoi Nha Trai"
              bankName={invitation.bankName}
              bankQrUrl={invitation.bankQrUrl}
              accountHolder={invitation.bankAccountHolder}
              accountNumber={invitation.bankAccountNumber}
              theme={theme}
              isFreeTier={isFreeTier}
            />
          )}
          {hasBride && (
            <BankCard
              label="Mung Cuoi Nha Gai"
              bankName={invitation.brideBankName}
              bankQrUrl={invitation.brideBankQrUrl}
              accountHolder={invitation.brideBankAccountHolder}
              accountNumber={invitation.brideBankAccountNumber}
              theme={theme}
              isFreeTier={isFreeTier}
            />
          )}
        </div>
      </div>
    </section>
  )
}
