'use client'
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem,
  SidebarRail, useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Heart, PlusCircle, CreditCard, Settings, Bell, LogOut, ChevronsLeft, User, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Thiệp cưới của tôi', href: '/thep-cuoi', icon: Heart },
  { label: 'Tạo thiệp mới', href: '/dashboard?create=1', icon: PlusCircle },
  { label: 'Gói dịch vụ & thanh toán', href: '/nang-cap', icon: CreditCard },
  { label: 'Cài đặt tài khoản', href: '/cai-dat', icon: Settings },
]

function CollapseToggle() {
  const { toggleSidebar, state } = useSidebar()
  return (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center size-8 rounded-lg text-[#5e4d52] hover:text-[#ec1349] hover:bg-[#f4f0f1] transition-colors shrink-0"
      title={state === 'expanded' ? 'Thu gọn' : 'Mở rộng'}
    >
      <ChevronsLeft className={`size-5 transition-transform duration-200 ${state === 'collapsed' ? 'rotate-180' : ''}`} />
    </button>
  )
}

function SidebarUserFooter() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/dang-nhap'
  }

  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-col gap-3">
      {/* Notification bell */}
      <div className={`flex ${isCollapsed ? 'justify-center' : 'px-2'}`}>
        <button className="relative p-2 text-[#5e4d52] hover:text-[#ec1349] transition-colors rounded-lg hover:bg-[#f4f0f1]">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-[#ec1349] rounded-full border-2 border-white" />
        </button>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-[#f4f0f1] transition-colors w-full ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className={`rounded-full bg-[#f4f0f1] border border-[#e6dbde] flex items-center justify-center shrink-0 ${isCollapsed ? 'size-8' : 'size-10'}`}>
            <span className="text-sm font-bold text-[#5e4d52]">N</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 text-left">
              <p className="text-[#181113] text-sm font-bold truncate">Người dùng</p>
              <p className="text-[#89616b] text-xs truncate">Gói Miễn phí</p>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 size-4" /> Tài khoản
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 size-4" /> Hỗ trợ
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600"
          >
            <LogOut className="mr-2 size-4" /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" className="border-r border-[#e6dbde] bg-white">
      {/* Brand / Logo area — matches Stitch header with logo + brand name */}
      <SidebarHeader className="border-b border-[#f4f0f1] px-6 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:justify-center">
            <div className="size-8 text-[#ec1349] shrink-0">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-[#181113] text-xl font-bold leading-tight truncate group-data-[collapsible=icon]:hidden">
              Cưới Đi
            </h2>
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <CollapseToggle />
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation links */}
      <SidebarContent className="px-4 py-6 group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  size="lg"
                  tooltip={item.label}
                  className={
                    isActive
                      ? 'bg-[#ec1349]/10 text-[#ec1349] font-bold hover:bg-[#ec1349]/10 hover:text-[#ec1349] rounded-lg px-3 py-3 gap-3 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center'
                      : 'text-[#5e4d52] hover:bg-[#f4f0f1] hover:text-[#181113] rounded-lg px-3 py-3 gap-3 font-medium transition-colors group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center'
                  }
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="text-sm leading-normal truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User info footer — avatar + name + plan badge + logout dropdown */}
      <SidebarFooter className="border-t border-[#f4f0f1] p-4 group-data-[collapsible=icon]:p-1">
        <SidebarUserFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
