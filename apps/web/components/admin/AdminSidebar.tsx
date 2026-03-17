'use client'
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard, Users, FileText, Music, Palette,
  CreditCard, Receipt, Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminNavItems = [
  { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { label: 'Người dùng', href: '/admin/nguoi-dung', icon: Users },
  { label: 'Thiệp cưới', href: '/admin/thiep-cuoi', icon: FileText },
  { label: 'Thư viện nhạc', href: '/admin/nhac', icon: Music },
  { label: 'Giao diện', href: '/admin/giao-dien', icon: Palette },
  { label: 'Gói dịch vụ', href: '/admin/goi-dich-vu', icon: CreditCard },
  { label: 'Thanh toán', href: '/admin/thanh-toan', icon: Receipt },
  { label: 'Cài đặt', href: '/admin/cai-dat', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" className="border-r border-[#2a1f22] bg-[#181113]">
      <SidebarHeader className="border-b border-[#2a1f22] p-4">
        <div>
          <span className="text-white font-bold text-base font-[family-name:var(--font-display)]">Thiep Cuoi Online</span>
          <p className="text-[#89616b] text-xs font-semibold uppercase tracking-wide mt-0.5">Admin</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#89616b] text-xs uppercase tracking-wide">
            Quản lý
          </SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href}
                  className="text-[#b8a0a5] hover:bg-[#2a1f22] hover:text-white rounded-lg transition-colors data-[active=true]:bg-[#ec1349]/15 data-[active=true]:text-[#ec1349] data-[active=true]:font-bold"
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
