import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/AppSidebar'
import { TopBar } from '@/components/app/TopBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top Header — Stitch style: h-16, white bg, breadcrumb left, actions right */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-[#e6dbde] shrink-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-[#5e4d52] hover:text-[#ec1349] md:hidden" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#89616b]">Trang chủ</span>
              <span className="text-[#e6dbde]">/</span>
              <span className="text-[#181113] font-medium">Tổng quan</span>
            </div>
          </div>
          <TopBar />
        </header>
        {/* Scrollable Page Content — Stitch style: #f8f6f6 bg, p-8 */}
        <main className="flex-1 overflow-y-auto bg-[#f8f6f6] p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
