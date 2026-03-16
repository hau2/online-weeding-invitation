'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

export function HeroSection({ invitation, theme }: SectionProps) {
  const heroImage = invitation.photoUrls?.[0]
  const ceremonyDate = invitation.groomCeremonyDate || invitation.brideCeremonyDate
  const formattedDate = ceremonyDate
    ? new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(ceremonyDate))
    : null

  return (
    <section id="couple" className="w-full max-w-[1200px] mx-auto px-4 py-6 md:px-10">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat p-8 text-center shadow-md md:gap-8 overflow-hidden',
          theme.heroMinHeight,
          theme.borderRadius
        )}
      >
        {/* Background image via next/image */}
        {heroImage ? (
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={`${invitation.groomName} & ${invitation.brideName}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div
              className="absolute inset-0"
              style={{ background: theme.heroOverlay }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}40 0%, ${theme.primaryColor}80 100%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="text-lg font-medium tracking-widest text-white/90 uppercase">
            Save The Date
          </span>
          <h1
            className={cn(
              'text-4xl leading-tight tracking-[-0.033em] text-white md:text-6xl font-display',
              theme.headingWeight
            )}
          >
            Le Thanh Hon
          </h1>
          <h2 className="text-xl font-normal leading-normal text-white md:text-2xl mt-2">
            {invitation.groomName || 'Chu re'}{' '}
            <span style={{ color: theme.primaryColor }} className="mx-2">
              &#9829;
            </span>{' '}
            {invitation.brideName || 'Co dau'}
          </h2>

          {/* Parent names — both families always visible (Vietnamese cultural norm) */}
          <div className="text-white/80 text-sm space-y-1 mt-2">
            {(invitation.groomFather || invitation.groomMother) && (
              <p>
                Nha trai:{' '}
                {invitation.groomFather && `Ong ${invitation.groomFather}`}
                {invitation.groomFather && invitation.groomMother && ' & '}
                {invitation.groomMother && `Ba ${invitation.groomMother}`}
              </p>
            )}
            {(invitation.brideFather || invitation.brideMother) && (
              <p>
                Nha gai:{' '}
                {invitation.brideFather && `Ong ${invitation.brideFather}`}
                {invitation.brideFather && invitation.brideMother && ' & '}
                {invitation.brideMother && `Ba ${invitation.brideMother}`}
              </p>
            )}
          </div>

          {formattedDate && (
            <p className="text-white/80 text-lg mt-1 font-light">{formattedDate}</p>
          )}
        </div>

        {/* CTA buttons */}
        <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-4">
          <a
            href="#gift"
            className={cn(
              'flex h-12 min-w-[140px] items-center justify-center px-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105',
              theme.borderRadius
            )}
            style={{ backgroundColor: theme.primaryColor }}
          >
            Tran trong kinh moi
          </a>
          <a
            href="#map"
            className={cn(
              'flex h-12 min-w-[140px] items-center justify-center bg-white/20 backdrop-blur-sm border border-white/40 px-6 text-base font-bold text-white transition-colors hover:bg-white/30',
              theme.borderRadius
            )}
          >
            Xem ban do
          </a>
        </div>
      </div>
    </section>
  )
}
