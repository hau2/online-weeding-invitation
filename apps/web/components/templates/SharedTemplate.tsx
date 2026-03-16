'use client'

import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from './themes'
import { HeroSection } from './sections/HeroSection'
import { CountdownSection } from './sections/CountdownSection'
import { TimelineSection } from './sections/TimelineSection'
import { GallerySection } from './sections/GallerySection'
import { VenueSection } from './sections/VenueSection'
import { BankQrSection } from './sections/BankQrSection'
import { FooterSection } from './sections/FooterSection'

interface SharedTemplateProps {
  invitation: Invitation
  theme: ThemeConfig
  className?: string
  ceremonyDate?: string | null
  ceremonyTime?: string | null
}

/**
 * SharedTemplate -- single layout component composing 7 content sections with theme config.
 * StickyNav is NOT included here -- it is rendered separately in InvitationShell (Plan 03)
 * because it sits outside the content scroll container.
 */
export function SharedTemplate({
  invitation,
  theme,
  className,
  ceremonyDate,
  ceremonyTime,
}: SharedTemplateProps) {
  return (
    <div
      className={cn('w-full font-display', className)}
      style={{
        backgroundColor: theme.backgroundColor,
        scrollBehavior: 'smooth',
        // CSS custom properties for theme colors
        '--theme-primary': theme.primaryColor,
        '--theme-bg': theme.backgroundColor,
        '--theme-surface': theme.surfaceColor,
        '--theme-text': theme.textColor,
        '--theme-muted': theme.mutedTextColor,
      } as React.CSSProperties}
    >
      <HeroSection invitation={invitation} theme={theme} />
      <CountdownSection
        invitation={invitation}
        theme={theme}
        ceremonyDate={ceremonyDate}
        ceremonyTime={ceremonyTime}
      />
      <TimelineSection invitation={invitation} theme={theme} />
      <GallerySection invitation={invitation} theme={theme} />
      <VenueSection invitation={invitation} theme={theme} />
      <BankQrSection invitation={invitation} theme={theme} />
      <FooterSection invitation={invitation} theme={theme} />
    </div>
  )
}
