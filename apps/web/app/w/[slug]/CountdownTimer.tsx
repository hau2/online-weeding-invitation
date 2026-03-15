'use client'

import { useState, useEffect, useRef } from 'react'
import type { TemplateId } from '@repo/types'

interface CountdownTimerProps {
  weddingDate: string
  weddingTime?: string | null
  templateId: TemplateId
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

// Template-specific styling
const TEMPLATE_STYLES: Record<TemplateId, { card: string; text: string; label: string; separator: string }> = {
  traditional: {
    card: 'bg-gray-900 text-amber-400',
    text: 'text-amber-400',
    label: 'text-amber-600',
    separator: 'text-amber-400',
  },
  modern: {
    card: 'bg-gray-800 text-white',
    text: 'text-white',
    label: 'text-gray-400',
    separator: 'text-white',
  },
  minimalist: {
    card: 'bg-gray-100 text-gray-800',
    text: 'text-gray-800',
    label: 'text-gray-500',
    separator: 'text-gray-800',
  },
}

function FlipCard({ value, label, templateId }: { value: string; label: string; templateId: TemplateId }) {
  const prevValue = useRef(value)
  const [flipping, setFlipping] = useState(false)
  const styles = TEMPLATE_STYLES[templateId]

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlipping(true)
      const timeout = setTimeout(() => setFlipping(false), 300)
      prevValue.current = value
      return () => clearTimeout(timeout)
    }
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-14 w-12 items-center justify-center rounded-lg sm:h-20 sm:w-16 ${styles.card}`}
        style={{
          perspective: '200px',
        }}
      >
        <span
          className={`text-xl font-bold sm:text-3xl ${styles.text}`}
          style={{
            animation: flipping ? 'flip 0.3s ease-in-out' : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {value}
        </span>
      </div>
      <span className={`mt-1 text-[10px] font-medium uppercase tracking-wider sm:text-xs ${styles.label}`}>
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer({ weddingDate, weddingTime, templateId }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    // Combine date + time in Vietnam timezone (UTC+7)
    const time = weddingTime || '10:00'
    const targetStr = `${weddingDate}T${time}:00+07:00`
    const targetMs = new Date(targetStr).getTime()

    function calculate() {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        setIsPast(true)
        return null
      }

      const totalSeconds = Math.floor(diff / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      return { days, hours, minutes, seconds }
    }

    // Initial calculation
    const initial = calculate()
    if (!initial) {
      setIsPast(true)
      return
    }
    setTimeLeft(initial)

    const interval = setInterval(() => {
      const result = calculate()
      if (!result) {
        clearInterval(interval)
        return
      }
      setTimeLeft(result)
    }, 1000)

    return () => clearInterval(interval)
  }, [weddingDate, weddingTime])

  if (isPast || !timeLeft) return null

  const styles = TEMPLATE_STYLES[templateId]

  return (
    <div className="flex items-center justify-center gap-2 py-6 sm:gap-3 sm:py-8">
      <FlipCard value={pad(timeLeft.days)} label="Ngay" templateId={templateId} />
      <span className={`text-xl font-bold sm:text-2xl ${styles.separator}`}>:</span>
      <FlipCard value={pad(timeLeft.hours)} label="Gio" templateId={templateId} />
      <span className={`text-xl font-bold sm:text-2xl ${styles.separator}`}>:</span>
      <FlipCard value={pad(timeLeft.minutes)} label="Phut" templateId={templateId} />
      <span className={`text-xl font-bold sm:text-2xl ${styles.separator}`}>:</span>
      <FlipCard value={pad(timeLeft.seconds)} label="Giay" templateId={templateId} />
    </div>
  )
}
