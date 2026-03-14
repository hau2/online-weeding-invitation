import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export const metadata = { title: 'Đăng ký — Thiệp Cưới Online' }

export default function DangKyPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
        <p className="text-sm text-gray-500">Bắt đầu tạo thiệp cưới của bạn</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/dang-nhap" className="text-rose-600 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
