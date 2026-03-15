import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CountdownTimer } from '@/app/w/[slug]/CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display all 4 units with Vietnamese labels', () => {
    // Set "now" to a known time, wedding is in the future
    vi.setSystemTime(new Date('2026-06-01T00:00:00+07:00'))

    render(
      <CountdownTimer
        ceremonyDate="2026-07-15"
        ceremonyTime="10:00"
        templateId="traditional"
      />
    )

    expect(screen.getByText('Ngay')).toBeInTheDocument()
    expect(screen.getByText('Gio')).toBeInTheDocument()
    expect(screen.getByText('Phut')).toBeInTheDocument()
    expect(screen.getByText('Giay')).toBeInTheDocument()
  })

  it('should update countdown every second', () => {
    vi.setSystemTime(new Date('2026-07-15T09:59:50+07:00'))

    render(
      <CountdownTimer
        ceremonyDate="2026-07-15"
        ceremonyTime="10:00"
        templateId="modern"
      />
    )

    // Should show 10 seconds initially
    expect(screen.getByText('10')).toBeInTheDocument()

    // Advance by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Should now show 09
    expect(screen.getByText('09')).toBeInTheDocument()
  })

  it('should hide when wedding date has passed', () => {
    // Set time AFTER the wedding
    vi.setSystemTime(new Date('2026-07-16T12:00:00+07:00'))

    const { container } = render(
      <CountdownTimer
        ceremonyDate="2026-07-15"
        ceremonyTime="10:00"
        templateId="minimalist"
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should use Vietnam timezone for calculation', () => {
    // Set time to 2026-07-14 23:00:00 UTC (which is 2026-07-15 06:00:00 +07:00)
    // Wedding is 2026-07-15 10:00 Vietnam time = 2026-07-15 03:00 UTC
    vi.setSystemTime(new Date('2026-07-14T23:00:00Z'))

    render(
      <CountdownTimer
        ceremonyDate="2026-07-15"
        ceremonyTime="10:00"
        templateId="traditional"
      />
    )

    // Should show 04 hours (from 06:00 to 10:00 Vietnam time)
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('should default to 10:00 if no ceremonyTime provided', () => {
    vi.setSystemTime(new Date('2026-07-15T00:00:00+07:00'))

    render(
      <CountdownTimer
        ceremonyDate="2026-07-15"
        templateId="modern"
      />
    )

    // Should show 10 hours (from 00:00 to 10:00)
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
