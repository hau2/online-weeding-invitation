'use client'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Package, HelpCircle, LogOut, Bell } from 'lucide-react'

export function TopBar() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/dang-nhap'
  }

  return (
    <div className="flex items-center gap-6">
      {/* Notification bell — Stitch style */}
      <button className="relative p-2 text-[#5e4d52] hover:text-[#ec1349] transition-colors rounded-full hover:bg-gray-100">
        <Bell className="size-5" />
        <span className="absolute top-2 right-2 size-2 bg-[#ec1349] rounded-full border-2 border-white" />
      </button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 text-[#181113] font-bold text-sm cursor-pointer hover:text-[#ec1349] transition-colors"
        >
          <div className="size-8 rounded-full bg-[#f4f0f1] border border-[#e6dbde] flex items-center justify-center">
            <User className="size-4 text-[#5e4d52]" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 size-4" /> Tài khoản
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Package className="mr-2 size-4" /> Gói dịch vụ
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
