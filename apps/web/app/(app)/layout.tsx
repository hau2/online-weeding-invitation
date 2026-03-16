import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/AppSidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile-only sidebar trigger */}
        <div className="flex items-center h-12 px-4 md:hidden shrink-0">
          <SidebarTrigger className="text-[#5e4d52] hover:text-[#ec1349]" />
        </div>
        {/* Scrollable Page Content — Stitch style: #f8f6f6 bg, p-8 */}
        <main className="flex-1 overflow-y-auto bg-[#f8f6f6] p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
