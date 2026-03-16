'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
}

export function GallerySection({ invitation, theme }: SectionProps) {
  if (!invitation.photoUrls?.length) return null

  const photos = invitation.photoUrls.slice(0, 6)

  return (
    <section
      id="album"
      className="w-full py-16"
      style={{ backgroundColor: theme.surfaceColor }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-10">
        <div className="mb-10 text-center">
          <h2
            className={cn('text-3xl', theme.headingWeight)}
            style={{ color: theme.textColor }}
          >
            Album Hinh Cuoi
          </h2>
          <p className="mt-2" style={{ color: theme.mutedTextColor }}>
            Nhung khoanh khac ngot ngao cua chung minh
          </p>
        </div>

        <div className={cn('grid grid-cols-2 md:grid-cols-3', theme.galleryGap)}>
          {photos.map((url, i) => (
            <div
              key={url}
              className={cn(
                'group relative aspect-[3/4] overflow-hidden bg-neutral-100',
                theme.borderRadius
              )}
            >
              <Image
                src={url}
                alt={`Anh cuoi ${i + 1}`}
                fill
                className={cn(
                  'object-cover transition-all duration-500 group-hover:scale-110',
                  theme.galleryEffect
                )}
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
