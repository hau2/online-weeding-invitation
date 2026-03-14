import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata = { title: 'Đăng nhập — Thiệp Cưới Online' }

export default function DangNhapPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="text-sm text-gray-500">Chào mừng bạn trở lại</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky" className="text-rose-600 hover:underline font-medium">
          Đăng ký miễn phí
        </Link>
      </p>
    </div>
  )
}
