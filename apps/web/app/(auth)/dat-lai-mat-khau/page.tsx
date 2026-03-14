import { ResetRequestForm } from '@/components/auth/reset-request-form'
import Link from 'next/link'

export const metadata = { title: 'Đặt lại mật khẩu — Thiệp Cưới Online' }

export default function DatLaiMatKhauPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-500">Nhập email để nhận liên kết đặt lại mật khẩu</p>
      </div>
      <ResetRequestForm />
      <p className="text-center text-sm text-gray-500">
        <Link href="/dang-nhap" className="text-rose-600 hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}
