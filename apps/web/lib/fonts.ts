import { Be_Vietnam_Pro, Playfair_Display, Dancing_Script } from 'next/font/google'

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

export const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-script',
  display: 'swap',
})
