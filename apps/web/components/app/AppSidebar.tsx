'use client'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Heart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Bảng điều khiển', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Thiệp cưới', href: '/thep-cuoi', icon: Heart },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" className="border-r border-rose-100">
      <SidebarHeader className="border-b border-rose-100 p-4">
        <span className="text-rose-600 font-semibold text-sm font-[var(--font-dancing-script)]">
          Thiệp Cưới
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-rose-400 text-xs uppercase tracking-wide">
            Menu
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  className="text-rose-800 hover:bg-rose-50 data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700"
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-rose-100 p-4">
        <p className="text-xs text-rose-300">v1.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}
