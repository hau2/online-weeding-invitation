import type { TemplateId } from '@repo/types'
import { modernRed } from './modern-red'
import { softPink } from './soft-pink'
import { brownGold } from './brown-gold'
import { oliveGreen } from './olive-green'
import { minimalistBw } from './minimalist-bw'
import { classicRedGold } from './classic-red-gold'

/**
 * ThemeConfig — defines all visual properties a section component needs.
 * One shared layout component renders all themes by consuming this interface.
 */
export interface ThemeConfig {
  id: string
  name: string
  // Colors
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedTextColor: string
  // Typography
  headingWeight: string
  bodyWeight: string
  letterSpacing: string
  textTransform: string
  // Borders & Shapes
  borderRadius: string
  cardBorderRadius: string
  // Hero
  heroOverlay: string
  heroMinHeight: string
  // Gallery
  galleryEffect: string
  galleryGap: string
  // Petals
  petalColors: string[]
  petalEnabled: boolean
  // Navigation
  navStyle: 'colored' | 'mono'
  // Footer
  footerBg: string
  footerTextColor: string
}

/**
 * ThemeId — union of the 6 new theme IDs.
 */
export type ThemeId =
  | 'modern-red'
  | 'soft-pink'
  | 'brown-gold'
  | 'olive-green'
  | 'minimalist-bw'
  | 'classic-red-gold'

/**
 * LEGACY_MAP — maps old TemplateId values to new ThemeId values.
 * No DB migration needed: old published invitations auto-map to new themes.
 */
export const LEGACY_MAP: Record<string, ThemeId> = {
  traditional: 'classic-red-gold',
  modern: 'modern-red',
  minimalist: 'minimalist-bw',
}

/**
 * THEMES — record of all 6 built-in theme configs.
 */
export const THEMES: Record<ThemeId, ThemeConfig> = {
  'modern-red': modernRed,
  'soft-pink': softPink,
  'brown-gold': brownGold,
  'olive-green': oliveGreen,
  'minimalist-bw': minimalistBw,
  'classic-red-gold': classicRedGold,
}

/**
 * getTheme — resolves any templateId (including legacy) to a ThemeConfig.
 * Falls back to modern-red for unknown IDs.
 */
export function getTheme(templateId: string): ThemeConfig {
  const themeId = LEGACY_MAP[templateId] ?? templateId
  return THEMES[themeId as ThemeId] ?? THEMES['modern-red']
}
