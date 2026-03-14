import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 px-4 h-14 border-b border-gray-200 bg-white">
          <SidebarTrigger className="text-gray-500 hover:text-gray-700" />
        </header>
        <main className="flex-1 bg-gray-50 min-h-[calc(100vh-3.5rem)] p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
