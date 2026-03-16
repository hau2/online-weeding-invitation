'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Invitation } from '@repo/types'
import type { ThemeConfig } from '../themes'

interface SectionProps {
  invitation: Invitation
  theme: ThemeConfig
  ceremonyDate?: string | null
  ceremonyTime?: string | null
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

export function CountdownSection({
  invitation: _invitation,
  theme,
  ceremonyDate,
  ceremonyTime,
}: SectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    if (!ceremonyDate) return

    // Combine date + time in Vietnam timezone (UTC+7)
    const time = ceremonyTime || '10:00'
    let targetMs: number

    const isoStr = `${ceremonyDate}T${time}:00+07:00`
    targetMs = new Date(isoStr).getTime()

    // If ISO parse fails, try raw Date parse
    if (isNaN(targetMs)) {
      targetMs = new Date(ceremonyDate).getTime()
    }

    // Still invalid -- bail out
    if (isNaN(targetMs)) {
      return
    }

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
  }, [ceremonyDate, ceremonyTime])

  // Return null if past, no date, or not yet calculated
  if (isPast || !timeLeft || !ceremonyDate) return null

  const isMono = theme.navStyle === 'mono'
  const units = [
    { value: timeLeft.days, label: 'Ngay' },
    { value: timeLeft.hours, label: 'Gio' },
    { value: timeLeft.minutes, label: 'Phut' },
    { value: timeLeft.seconds, label: 'Giay' },
  ]

  return (
    <section className="w-full max-w-[960px] mx-auto px-4 py-12">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h3
            className={cn('text-2xl', theme.headingWeight)}
            style={{ color: theme.textColor }}
          >
            {isMono ? 'Coming Soon' : 'Cung dem nguoc giay phut hanh phuc'}
          </h3>
          <p className="mt-2" style={{ color: theme.mutedTextColor }}>
            {isMono
              ? 'Cung dem nguoc khoang khac hanh phuc'
              : 'Chi con mot chut thoi gian nua thoi...'}
          </p>
        </div>

        <div className={cn(
          'flex w-full max-w-[600px]',
          isMono ? 'grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16 max-w-4xl' : 'gap-3 md:gap-6'
        )}>
          {units.map((unit) =>
            isMono ? (
              // B&W Minimalist: bare numbers, no card boxes
              <div key={unit.label} className="flex flex-col items-center">
                <span
                  className="text-5xl md:text-6xl font-light tabular-nums"
                  style={{ color: theme.textColor }}
                >
                  {pad(unit.value)}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2"
                  style={{ color: theme.mutedTextColor }}
                >
                  {unit.label}
                </span>
              </div>
            ) : (
              // Default: card-box style
              <div key={unit.label} className="flex grow basis-0 flex-col items-stretch gap-2">
                <div
                  className={cn(
                    'flex h-20 md:h-24 grow items-center justify-center shadow-sm border border-neutral-100',
                    theme.borderRadius
                  )}
                  style={{ backgroundColor: theme.surfaceColor }}
                >
                  <p
                    className="text-3xl md:text-4xl font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {pad(unit.value)}
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="text-xs md:text-sm font-medium uppercase tracking-wide"
                    style={{ color: theme.mutedTextColor }}
                  >
                    {unit.label}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
