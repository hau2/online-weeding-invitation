import { Be_Vietnam_Pro, Playfair_Display, Dancing_Script } from 'next/font/google'

/**
 * Be Vietnam Pro — primary body font, Vietnamese-optimized sans-serif.
 * Used for all UI text, labels, form inputs, body copy.
 */
export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  preload: true,
})

/**
 * Playfair Display — serif heading font for invitation titles and couple names.
 * Used in invitation templates and section headings.
 */
export const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
})

/**
 * Dancing Script — cursive/script font for decorative wedding elements.
 * Used sparingly: couple name display on invitation, decorative accents.
 */
export const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-script',
  display: 'swap',
})
