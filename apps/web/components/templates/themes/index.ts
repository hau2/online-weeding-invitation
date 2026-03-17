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
  // Background image (custom themes only)
  backgroundImageUrl?: string
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

/**
 * buildThemeConfig — takes a raw JSONB config from the API and casts/validates
 * it into a proper ThemeConfig, using modern-red as defaults for any missing fields.
 */
export function buildThemeConfig(raw: Record<string, unknown>): ThemeConfig {
  const defaults = THEMES['modern-red']
  return {
    id: (raw.id as string) ?? defaults.id,
    name: (raw.name as string) ?? defaults.name,
    primaryColor: (raw.primaryColor as string) ?? defaults.primaryColor,
    backgroundColor: (raw.backgroundColor as string) ?? defaults.backgroundColor,
    surfaceColor: (raw.surfaceColor as string) ?? defaults.surfaceColor,
    textColor: (raw.textColor as string) ?? defaults.textColor,
    mutedTextColor: (raw.mutedTextColor as string) ?? defaults.mutedTextColor,
    headingWeight: (raw.headingWeight as string) ?? defaults.headingWeight,
    bodyWeight: (raw.bodyWeight as string) ?? defaults.bodyWeight,
    letterSpacing: (raw.letterSpacing as string) ?? defaults.letterSpacing,
    textTransform: (raw.textTransform as string) ?? defaults.textTransform,
    borderRadius: (raw.borderRadius as string) ?? defaults.borderRadius,
    cardBorderRadius: (raw.cardBorderRadius as string) ?? defaults.cardBorderRadius,
    heroOverlay: (raw.heroOverlay as string) ?? defaults.heroOverlay,
    heroMinHeight: (raw.heroMinHeight as string) ?? defaults.heroMinHeight,
    galleryEffect: (raw.galleryEffect as string) ?? defaults.galleryEffect,
    galleryGap: (raw.galleryGap as string) ?? defaults.galleryGap,
    petalColors: (Array.isArray(raw.petalColors) ? raw.petalColors as string[] : defaults.petalColors),
    petalEnabled: typeof raw.petalEnabled === 'boolean' ? raw.petalEnabled : defaults.petalEnabled,
    navStyle: (raw.navStyle === 'colored' || raw.navStyle === 'mono') ? raw.navStyle : defaults.navStyle,
    footerBg: (raw.footerBg as string) ?? defaults.footerBg,
    footerTextColor: (raw.footerTextColor as string) ?? defaults.footerTextColor,
    backgroundImageUrl: (raw.backgroundImageUrl as string) ?? undefined,
  }
}
