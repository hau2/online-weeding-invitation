'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/dang-nhap'
  const isRegister = pathname === '/dang-ky'
  const showTabs = isLogin || isRegister

  return (
    <div className="min-h-screen bg-[#f8f6f6] flex flex-col font-[family-name:var(--font-display)]">
      {/* Header */}
      <header className="w-full bg-white border-b border-[#e6dbde] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-[#ec1349] fill-[#ec1349]" />
              <span className="text-xl font-bold tracking-tight text-[#181113]">WeddingConnect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-[#89616b] hover:text-[#ec1349] transition-colors hidden sm:block"
              >
                Trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          {/* Left side — branding illustration */}
          <div
            className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative flex-col justify-end p-10 text-white"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCX6SDsBKq2Im55XCCkwT-sgMFnOgILOYlpj0GcdMVZJXxfmMyWwvCHXwRrwD0_jXoj3wUuEBJH4lHrzHxoXRT6cu344QUPeq6-CjF2taxfCFm64DnmiJvGXbbM84ThKCgKbGPxsELdj6l4t7ZUBfBP-5R8IoqN8XZNr-LVad3aJED1c66Ww9FhaDZ0pz-R22MekGVxag1BSj24e4j5MtmqqiC2znOxMPZEgNRw-rbZOKUl5xnd6YBBu79JL87cS-Px7pSNOFFBon4')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-0 rounded-l-2xl" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-bold leading-tight">
                Tạo thiệp cưới online &amp; QR Code đẳng cấp
              </h2>
              <p className="text-white/90 text-lg font-light">
                Nền tảng số 1 Việt Nam giúp bạn chia sẻ ngày vui một cách trọn vẹn và hiện đại nhất.
              </p>
              <div className="flex gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white/50" />
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </div>
            </div>
          </div>

          {/* Right side — form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col">
            <div className="flex flex-col h-full">
              {/* Tab navigation — only on login/register pages */}
              {showTabs && (
                <div className="flex border-b border-[#e6dbde] mb-8">
                  <Link
                    href="/dang-nhap"
                    className={`flex-1 text-center pb-3 text-sm font-bold border-b-[3px] transition-colors ${
                      isLogin
                        ? 'text-[#181113] border-[#181113]'
                        : 'text-[#89616b] border-transparent hover:text-[#ec1349]'
                    }`}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className={`flex-1 text-center pb-3 text-sm font-bold border-b-[3px] transition-colors ${
                      isRegister
                        ? 'text-[#181113] border-[#181113]'
                        : 'text-[#89616b] border-transparent hover:text-[#ec1349]'
                    }`}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Form content with animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex-1"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="mt-8 text-center sm:hidden">
          <p className="text-sm text-[#89616b]">&copy; 2024 WeddingConnect. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}
