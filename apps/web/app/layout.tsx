import type { Metadata } from 'next'
import { beVietnamPro, playfairDisplay, dancingScript } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thiệp Cưới Online',
  description: 'Tạo và chia sẻ thiệp cưới trực tuyến đẹp mắt',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} ${playfairDisplay.variable} ${dancingScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
