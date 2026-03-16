'use client'

import type { CeremonyProgramEvent } from '@repo/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Clock } from 'lucide-react'

interface CeremonyProgramEditorProps {
  events: CeremonyProgramEvent[]
  onChange: (events: CeremonyProgramEvent[]) => void
}

export function CeremonyProgramEditor({
  events,
  onChange,
}: CeremonyProgramEditorProps) {
  function handleAddEvent() {
    if (events.length >= 10) return
    onChange([...events, { time: '', title: '', description: '' }])
  }

  function handleRemoveEvent(index: number) {
    onChange(events.filter((_, i) => i !== index))
  }

  function handleEventChange(
    index: number,
    field: keyof CeremonyProgramEvent,
    value: string,
  ) {
    onChange(
      events.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    )
  }

  return (
    <div className="space-y-3 py-2">
      {events.map((event, index) => (
        <div
          key={index}
          className="relative border border-gray-200 rounded-lg p-3 space-y-3"
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Su kien {index + 1}</span>
          </div>

          <button
            type="button"
            onClick={() => handleRemoveEvent(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`Xoa su kien ${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="space-y-1.5">
            <Label className="text-gray-600 text-xs">Thoi gian</Label>
            <Input
              placeholder="VD: 8:00 sang, 10h30"
              className="border-gray-200 focus-visible:border-gray-400 focus-visible:ring-gray-200"
              value={event.time}
              onChange={(e) =>
                handleEventChange(index, 'time', e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-600 text-xs">Tieu de</Label>
            <Input
              placeholder="VD: Don dau"
              maxLength={100}
              className="border-gray-200 focus-visible:border-gray-400 focus-visible:ring-gray-200"
              value={event.title}
              onChange={(e) =>
                handleEventChange(index, 'title', e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-600 text-xs">Mo ta</Label>
            <Textarea
              placeholder="VD: Nha trai den nha gai..."
              rows={2}
              maxLength={300}
              className="border-gray-200 focus-visible:border-gray-400 focus-visible:ring-gray-200"
              value={event.description}
              onChange={(e) =>
                handleEventChange(index, 'description', e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddEvent}
        disabled={events.length >= 10}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
        Them su kien
      </button>
    </div>
  )
}
