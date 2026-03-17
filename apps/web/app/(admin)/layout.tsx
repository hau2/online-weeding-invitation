import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex items-center gap-3 px-6 h-14 border-b border-[#e6dbde] bg-white">
          <SidebarTrigger className="text-[#89616b] hover:text-[#ec1349]" />
        </header>
        <main className="flex-1 bg-[#f8f6f6] font-[family-name:var(--font-display)] min-h-[calc(100vh-3.5rem)] p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
