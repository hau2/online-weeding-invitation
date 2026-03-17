/**
 * Built-in theme configs duplicated from apps/web/components/templates/themes/.
 * These are static data that only changes in code.
 * Avoids cross-app imports between API and Web.
 */

export interface ThemeConfig {
  id: string
  name: string
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedTextColor: string
  headingWeight: string
  bodyWeight: string
  letterSpacing: string
  textTransform: string
  borderRadius: string
  cardBorderRadius: string
  heroOverlay: string
  heroMinHeight: string
  galleryEffect: string
  galleryGap: string
  petalColors: string[]
  petalEnabled: boolean
  navStyle: 'colored' | 'mono'
  footerBg: string
  footerTextColor: string
}

export const BUILTIN_THEMES: Record<string, ThemeConfig> = {
  'modern-red': {
    id: 'modern-red',
    name: 'Hien dai - Do',
    primaryColor: '#ec1349',
    backgroundColor: '#f8f6f6',
    surfaceColor: '#ffffff',
    textColor: '#181113',
    mutedTextColor: '#737373',
    headingWeight: 'font-black',
    bodyWeight: 'font-medium',
    letterSpacing: 'tracking-[-0.015em]',
    textTransform: 'normal-case',
    borderRadius: 'rounded-xl',
    cardBorderRadius: 'rounded-2xl',
    heroOverlay: 'linear-gradient(rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
    heroMinHeight: 'min-h-[560px]',
    galleryEffect: '',
    galleryGap: 'gap-3 md:gap-6 lg:gap-8',
    petalColors: ['#FFD1DC', '#FFC0CB', '#FFE4E1', '#FFFFFF'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: 'bg-white',
    footerTextColor: '#181113',
  },
  'soft-pink': {
    id: 'soft-pink',
    name: 'Nhe nhang - Hong',
    primaryColor: '#E88D8D',
    backgroundColor: '#FFF0F0',
    surfaceColor: '#ffffff',
    textColor: '#2D1F1F',
    mutedTextColor: '#8C7373',
    headingWeight: 'font-bold',
    bodyWeight: 'font-medium',
    letterSpacing: 'tracking-[-0.01em]',
    textTransform: 'normal-case',
    borderRadius: 'rounded-xl',
    cardBorderRadius: 'rounded-2xl',
    heroOverlay: 'linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
    heroMinHeight: 'min-h-[560px]',
    galleryEffect: '',
    galleryGap: 'gap-3 md:gap-6',
    petalColors: ['#FFD1DC', '#FECDD3', '#FFF0F5', '#FFFFFF'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: 'bg-rose-50',
    footerTextColor: '#2D1F1F',
  },
  'brown-gold': {
    id: 'brown-gold',
    name: 'Am ap - Nau vang',
    primaryColor: '#8B6F47',
    backgroundColor: '#FAF5EF',
    surfaceColor: '#ffffff',
    textColor: '#3D2E1C',
    mutedTextColor: '#8C7A63',
    headingWeight: 'font-bold',
    bodyWeight: 'font-medium',
    letterSpacing: 'tracking-normal',
    textTransform: 'normal-case',
    borderRadius: 'rounded-lg',
    cardBorderRadius: 'rounded-xl',
    heroOverlay: 'linear-gradient(rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)',
    heroMinHeight: 'min-h-[560px]',
    galleryEffect: '',
    galleryGap: 'gap-3 md:gap-6',
    petalColors: ['#F5E6D3', '#E8D5BD', '#DFC8A8', '#FAF5EF'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: 'bg-amber-50',
    footerTextColor: '#3D2E1C',
  },
  'olive-green': {
    id: 'olive-green',
    name: 'Tu nhien - Xanh o liu',
    primaryColor: '#6B7A3C',
    backgroundColor: '#F7F5EF',
    surfaceColor: '#ffffff',
    textColor: '#2D331F',
    mutedTextColor: '#6B7355',
    headingWeight: 'font-bold',
    bodyWeight: 'font-medium',
    letterSpacing: 'tracking-normal',
    textTransform: 'normal-case',
    borderRadius: 'rounded-lg',
    cardBorderRadius: 'rounded-xl',
    heroOverlay: 'linear-gradient(rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 100%)',
    heroMinHeight: 'min-h-[560px]',
    galleryEffect: '',
    galleryGap: 'gap-3 md:gap-6',
    petalColors: ['#D4E2B6', '#C7D9A0', '#B8CF8A', '#E8F0D8'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: 'bg-green-50',
    footerTextColor: '#2D331F',
  },
  'minimalist-bw': {
    id: 'minimalist-bw',
    name: 'Toi gian - Trang den',
    primaryColor: '#171717',
    backgroundColor: '#ffffff',
    surfaceColor: '#f5f5f5',
    textColor: '#171717',
    mutedTextColor: '#737373',
    headingWeight: 'font-light',
    bodyWeight: 'font-light',
    letterSpacing: 'tracking-[0.2em]',
    textTransform: 'uppercase',
    borderRadius: 'rounded-none',
    cardBorderRadius: 'rounded-none',
    heroOverlay: 'rgba(0,0,0,0.5)',
    heroMinHeight: 'min-h-[600px]',
    galleryEffect: 'grayscale hover:grayscale-0',
    galleryGap: 'gap-2 md:gap-4',
    petalColors: [],
    petalEnabled: false,
    navStyle: 'mono',
    footerBg: 'bg-neutral-900',
    footerTextColor: '#ffffff',
  },
  'classic-red-gold': {
    id: 'classic-red-gold',
    name: 'Co dien - Do vang',
    primaryColor: '#8B1A1A',
    backgroundColor: '#FFF8F0',
    surfaceColor: '#ffffff',
    textColor: '#3D1A1A',
    mutedTextColor: '#8C6B5A',
    headingWeight: 'font-bold',
    bodyWeight: 'font-medium',
    letterSpacing: 'tracking-normal',
    textTransform: 'normal-case',
    borderRadius: 'rounded-lg',
    cardBorderRadius: 'rounded-xl',
    heroOverlay: 'linear-gradient(rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
    heroMinHeight: 'min-h-[560px]',
    galleryEffect: '',
    galleryGap: 'gap-3 md:gap-6',
    petalColors: ['#FFB7C5', '#FF69B4', '#FF1493', '#DC143C'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: 'bg-amber-50',
    footerTextColor: '#3D1A1A',
  },
}

/** Legacy theme ID mapping (same as web) */
export const LEGACY_MAP: Record<string, string> = {
  traditional: 'classic-red-gold',
  modern: 'modern-red',
  minimalist: 'minimalist-bw',
}

/** All known built-in theme IDs including legacy */
export const BUILTIN_IDS = [
  'modern-red', 'soft-pink', 'brown-gold', 'olive-green',
  'minimalist-bw', 'classic-red-gold',
  'traditional', 'modern', 'minimalist',
]

/**
 * Resolve a built-in theme config by ID (including legacy mapping).
 * Returns undefined for custom themes.
 */
export function resolveBuiltinTheme(themeId: string): ThemeConfig | undefined {
  const resolved = LEGACY_MAP[themeId] ?? themeId
  return BUILTIN_THEMES[resolved]
}
