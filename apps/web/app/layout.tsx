import type { Metadata } from 'next'
import { beVietnamPro, playfairDisplay, dancingScript } from '@/lib/fonts'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s — Thiệp Cưới Online',
    default: 'Thiệp Cưới Online',
  },
  description: 'Tạo và chia sẻ thiệp cưới trực tuyến đẹp mắt với mã QR duy nhất',
  // Note: og:image and og:locale added per-page in Phase 5
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`
          ${beVietnamPro.variable}
          ${playfairDisplay.variable}
          ${dancingScript.variable}
          font-sans antialiased
        `}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
