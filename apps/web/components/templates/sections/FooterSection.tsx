'use client'

import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

export function FooterSection({ invitation, theme }: SectionProps) {
  const coupleName = `${invitation.groomName || 'Chu re'} & ${invitation.brideName || 'Co dau'}`
  const thankYou = invitation.thankYouText || 'Rat han hanh duoc don tiep quy khach.'

  // Handle dual-format footerBg: hex color (custom themes) vs Tailwind class (built-in themes)
  const isHex = theme.footerBg.startsWith('#')

  return (
    <footer
      className={cn('w-full py-12 px-4 text-center', !isHex && theme.footerBg)}
      style={isHex ? { backgroundColor: theme.footerBg } : undefined}
    >
      <div className="flex flex-col items-center gap-4">
        <h2
          className={cn(
            'text-2xl',
            theme.navStyle === 'mono' ? 'font-light uppercase tracking-widest' : 'font-bold'
          )}
          style={{ color: theme.navStyle === 'mono' ? theme.footerTextColor : theme.primaryColor }}
        >
          {coupleName}
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{
            color:
              theme.navStyle === 'mono'
                ? theme.footerTextColor + 'CC'
                : theme.mutedTextColor,
          }}
        >
          {thankYou}
        </p>
        {theme.navStyle === 'mono' && (
          <div className="w-8 h-[1px] bg-neutral-700 my-4" />
        )}
        <p
          className={cn(
            'text-xs',
            theme.navStyle === 'mono' ? 'uppercase tracking-widest' : ''
          )}
          style={{
            color:
              theme.navStyle === 'mono'
                ? theme.footerTextColor + '66'
                : theme.mutedTextColor + '80',
          }}
        >
          &copy; {new Date().getFullYear()} Thiep Cuoi Online
        </p>
      </div>
    </footer>
  )
}
