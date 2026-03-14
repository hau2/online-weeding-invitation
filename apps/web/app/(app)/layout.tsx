import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/AppSidebar'
import { TopBar } from '@/components/app/TopBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 px-4 h-14 border-b border-rose-100 bg-white">
          <SidebarTrigger className="text-rose-400 hover:text-rose-600" />
          <div className="flex-1" />
          <TopBar />
        </header>
        <main className="flex-1 bg-rose-50/30 min-h-[calc(100vh-3.5rem)] p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
