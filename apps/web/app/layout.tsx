import type { Metadata } from 'next'
import { beVietnamPro, playfairDisplay, dancingScript, plusJakartaSans } from '@/lib/fonts'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="vi" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body
        className={`
          ${beVietnamPro.variable}
          ${playfairDisplay.variable}
          ${dancingScript.variable}
          ${plusJakartaSans.variable}
          font-sans antialiased
        `}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
