'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

export function TimelineSection({ invitation, theme }: SectionProps) {
  if (!invitation.loveStory || invitation.loveStory.length === 0) return null

  return (
    <section id="timeline" className="w-full max-w-[960px] mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h2
          className={cn('text-3xl', theme.headingWeight)}
          style={{ color: theme.textColor }}
        >
          Cau Chuyen Tinh Yeu
        </h2>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[19px] top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: theme.mutedTextColor + '40' }}
        />

        {invitation.loveStory.map((milestone, index) => (
          <div key={index} className="relative flex gap-6 pb-10 last:pb-0">
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.primaryColor + '15' }}
              >
                <Heart
                  className="size-4"
                  style={{ color: theme.primaryColor }}
                  fill="currentColor"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col pt-1">
              {milestone.date && (
                <span
                  className="text-sm font-bold"
                  style={{ color: theme.primaryColor }}
                >
                  {milestone.date}
                </span>
              )}
              <h3
                className="text-lg font-medium mt-1"
                style={{ color: theme.textColor }}
              >
                {milestone.title}
              </h3>
              {milestone.description && (
                <p
                  className="mt-1 leading-relaxed"
                  style={{ color: theme.mutedTextColor }}
                >
                  {milestone.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
