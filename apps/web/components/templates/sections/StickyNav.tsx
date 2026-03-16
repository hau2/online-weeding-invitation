'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

const NAV_LINKS = [
  { href: '#couple', label: 'Cap doi' },
  { href: '#timeline', label: 'Su kien' },
  { href: '#album', label: 'Album' },
  { href: '#map', label: 'Ban do' },
  { href: '#gift', label: 'Mung cuoi' },
]

export function StickyNav({ invitation: _invitation, theme }: SectionProps) {
  const isMono = theme.navStyle === 'mono'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 hidden md:flex w-full items-center justify-between border-b px-6 py-3 backdrop-blur-md md:px-10 lg:px-20',
        isMono
          ? 'border-neutral-100 bg-white/95'
          : 'border-neutral-200 bg-white/90'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div style={{ color: isMono ? '#171717' : theme.primaryColor }}>
          <Heart className="size-8" fill="currentColor" />
        </div>
        <h2
          className={cn(
            'text-lg font-bold leading-tight hidden sm:block',
            isMono
              ? 'text-sm tracking-[0.1em] uppercase text-neutral-900'
              : 'tracking-[-0.015em] text-neutral-900'
          )}
        >
          {isMono ? 'The Wedding' : 'Thiep Cuoi Online'}
        </h2>
      </div>

      {/* Navigation links */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              'font-medium transition-colors',
              isMono
                ? 'text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-neutral-500'
                : 'text-sm text-neutral-900 hover:text-[var(--theme-primary)]'
            )}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <div className="flex items-center gap-4">
        <a
          href="#gift"
          className={cn(
            'flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden px-4 text-white transition-colors',
            isMono
              ? 'bg-neutral-900 px-6 text-xs font-bold uppercase tracking-widest hover:bg-neutral-700'
              : 'rounded-lg bg-[var(--theme-primary)] hover:opacity-90'
          )}
          style={!isMono ? { backgroundColor: theme.primaryColor } : undefined}
        >
          <span className={cn('truncate font-bold', isMono ? 'text-xs' : 'text-sm')}>
            Gui loi chuc
          </span>
        </a>
      </div>
    </header>
  )
}
