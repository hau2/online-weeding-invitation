'use client'

import { useState, useEffect } from 'react'
import type { TemplateId } from '@repo/types'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface TemplateSelectorProps {
  currentTemplate: TemplateId
  onSelect: (id: TemplateId) => void
}

interface CustomThemeForSelector {
  slug: string
  name: string
  config: { primaryColor: string; backgroundColor: string; textColor: string }
}

const themes: { id: TemplateId; label: string; gradient: string }[] = [
  {
    id: 'modern-red',
    label: 'Hien dai - Do',
    gradient: 'bg-gradient-to-br from-red-500 to-rose-300',
  },
  {
    id: 'soft-pink',
    label: 'Hong dao',
    gradient: 'bg-gradient-to-br from-pink-300 to-rose-200',
  },
  {
    id: 'brown-gold',
    label: 'Nau vang',
    gradient: 'bg-gradient-to-br from-amber-700 to-yellow-400',
  },
  {
    id: 'olive-green',
    label: 'Xanh olive',
    gradient: 'bg-gradient-to-br from-green-700 to-lime-300',
  },
  {
    id: 'minimalist-bw',
    label: 'Toi gian',
    gradient: 'bg-gradient-to-br from-neutral-900 to-gray-400',
  },
  {
    id: 'classic-red-gold',
    label: 'Co dien',
    gradient: 'bg-gradient-to-br from-red-900 to-amber-500',
  },
]

export function TemplateSelector({
  currentTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const [customThemes, setCustomThemes] = useState<CustomThemeForSelector[]>([])

  useEffect(() => {
    fetch(`${API_URL}/themes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Array<{ slug: string; name: string; config: Record<string, unknown> }>) =>
        setCustomThemes(
          data.map((t) => ({
            slug: t.slug,
            name: t.name,
            config: {
              primaryColor: (t.config.primaryColor as string) ?? '#ec1349',
              backgroundColor: (t.config.backgroundColor as string) ?? '#ffffff',
              textColor: (t.config.textColor as string) ?? '#181113',
            },
          }))
        )
      )
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Built-in themes */}
      {themes.map((t) => {
        const isSelected = currentTemplate === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              'flex flex-col items-center gap-1 group cursor-pointer',
            )}
          >
            <div
              className={cn(
                'w-full aspect-[3/4] rounded-md border-2 transition-all',
                t.gradient,
                isSelected
                  ? 'border-rose-500 ring-2 ring-rose-300'
                  : 'border-gray-200 hover:border-rose-200',
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium',
                isSelected ? 'text-rose-700' : 'text-gray-500',
              )}
            >
              {t.label}
            </span>
          </button>
        )
      })}

      {/* Custom themes from API */}
      {customThemes.map((ct) => {
        const isSelected = currentTemplate === ct.slug
        return (
          <button
            key={ct.slug}
            type="button"
            onClick={() => onSelect(ct.slug)}
            className={cn(
              'flex flex-col items-center gap-1 group cursor-pointer',
            )}
          >
            <div
              className="w-full aspect-[3/4] rounded-md overflow-hidden border-2 transition-all"
              style={{
                borderColor: isSelected ? '#ec1349' : '#e5e7eb',
                boxShadow: isSelected ? '0 0 0 2px rgba(244, 63, 94, 0.3)' : undefined,
              }}
            >
              <div className="h-1/3" style={{ backgroundColor: ct.config.primaryColor }} />
              <div
                className="h-2/3 flex items-center justify-center p-2"
                style={{ backgroundColor: ct.config.backgroundColor }}
              >
                <span className="text-xs font-medium" style={{ color: ct.config.textColor }}>
                  {ct.name}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                isSelected ? 'text-rose-700' : 'text-gray-500',
              )}
            >
              {ct.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
