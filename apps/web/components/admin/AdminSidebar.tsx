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
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <span className="text-gray-700 font-semibold text-sm">Admin Panel</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wide">
            Quản lý
          </SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href}
                  className="text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100"
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
