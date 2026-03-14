'use client'

import type { TemplateId } from '@repo/types'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  currentTemplate: TemplateId
  onSelect: (id: TemplateId) => void
}

const templates: { id: TemplateId; label: string; gradient: string }[] = [
  {
    id: 'traditional',
    label: 'Truyen thong',
    gradient: 'bg-gradient-to-br from-red-700 to-yellow-600',
  },
  {
    id: 'modern',
    label: 'Hien dai',
    gradient: 'bg-gradient-to-br from-white to-rose-200',
  },
  {
    id: 'minimalist',
    label: 'Toi gian',
    gradient: 'bg-gradient-to-br from-amber-50 to-gray-200',
  },
]

export function TemplateSelector({
  currentTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {templates.map((t) => {
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
                'w-14 aspect-[3/4] rounded-md border-2 transition-all',
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
    </div>
  )
}
