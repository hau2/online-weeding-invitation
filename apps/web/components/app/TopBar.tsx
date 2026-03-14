'use client'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Package, HelpCircle, LogOut, ChevronDown } from 'lucide-react'

export function TopBar() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/dang-nhap'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1 text-rose-700 hover:bg-rose-50 rounded-md px-2 py-1 cursor-pointer"
      >
        <div className="size-7 rounded-full bg-rose-100 flex items-center justify-center">
          <User className="size-4 text-rose-600" />
        </div>
        <ChevronDown className="size-3 text-rose-400" />
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
  )
}
