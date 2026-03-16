'use client'
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Heart, PlusCircle, CreditCard, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Thiệp cưới của tôi', href: '/thep-cuoi', icon: Heart },
  { label: 'Tạo thiệp mới', href: '/dashboard?create=1', icon: PlusCircle },
  { label: 'Gói dịch vụ & thanh toán', href: '/nang-cap', icon: CreditCard },
  { label: 'Cài đặt tài khoản', href: '/cai-dat', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" className="border-r border-[#e6dbde] bg-white">
      {/* Brand / Logo area — matches Stitch header with logo + brand name */}
      <SidebarHeader className="border-b border-[#f4f0f1] px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="size-8 text-[#ec1349] shrink-0">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-[#181113] text-xl font-bold leading-tight truncate">
            Cưới Đi
          </h2>
        </Link>
      </SidebarHeader>

      {/* Navigation links */}
      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  size="lg"
                  className={
                    isActive
                      ? 'bg-[#ec1349]/10 text-[#ec1349] font-bold hover:bg-[#ec1349]/10 hover:text-[#ec1349] rounded-lg px-3 py-3 gap-3'
                      : 'text-[#5e4d52] hover:bg-[#f4f0f1] hover:text-[#181113] rounded-lg px-3 py-3 gap-3 font-medium transition-colors'
                  }
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="text-sm leading-normal truncate">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User info footer — matches Stitch avatar + name + plan badge */}
      <SidebarFooter className="border-t border-[#f4f0f1] p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="size-10 rounded-full bg-[#f4f0f1] border border-[#e6dbde] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#5e4d52]">N</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[#181113] text-sm font-bold truncate">Người dùng</p>
            <p className="text-[#89616b] text-xs truncate">Gói Miễn phí</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
