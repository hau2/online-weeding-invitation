import { describe, it, expect } from 'vitest'
import { getTheme, THEMES } from '@/components/templates/themes'
import type { ThemeConfig } from '@/components/templates/themes'

describe('Theme config', () => {
  it('exports all 6 theme configs', () => {
    expect(Object.keys(THEMES)).toHaveLength(6)
  })

  it('each theme config has required properties', () => {
    const requiredKeys: (keyof ThemeConfig)[] = [
      'id', 'name', 'primaryColor', 'backgroundColor', 'surfaceColor',
      'textColor', 'mutedTextColor', 'headingWeight', 'bodyWeight',
      'borderRadius', 'cardBorderRadius', 'heroOverlay', 'heroMinHeight',
      'galleryEffect', 'galleryGap', 'petalColors', 'petalEnabled',
      'navStyle', 'footerBg', 'footerTextColor',
    ]
    Object.values(THEMES).forEach((theme) => {
      requiredKeys.forEach((key) => {
        expect(theme).toHaveProperty(key)
      })
    })
  })

  it('minimalist-bw has petalEnabled false', () => {
    expect(THEMES['minimalist-bw'].petalEnabled).toBe(false)
  })

  it('modern-red has primary color #ec1349', () => {
    expect(THEMES['modern-red'].primaryColor).toBe('#ec1349')
  })
})

describe('Legacy mapping', () => {
  it('maps traditional to classic-red-gold', () => {
    expect(getTheme('traditional').id).toBe('classic-red-gold')
  })

  it('maps modern to modern-red', () => {
    expect(getTheme('modern').id).toBe('modern-red')
  })

  it('maps minimalist to minimalist-bw', () => {
    expect(getTheme('minimalist').id).toBe('minimalist-bw')
  })

  it('returns theme directly for new theme IDs', () => {
    expect(getTheme('soft-pink').id).toBe('soft-pink')
  })

  it('falls back to modern-red for unknown ID', () => {
    expect(getTheme('nonexistent').id).toBe('modern-red')
  })
})
