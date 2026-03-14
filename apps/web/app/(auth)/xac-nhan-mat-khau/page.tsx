import { Suspense } from 'react'
import { ResetConfirmForm } from '@/components/auth/reset-confirm-form'

export const metadata = { title: 'Xác nhận mật khẩu mới — Thiệp Cưới Online' }

export default function XacNhanMatKhauPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Đặt mật khẩu mới</h1>
        <p className="text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>
      <Suspense fallback={<div className="text-center text-gray-500 py-4">Đang tải...</div>}>
        <ResetConfirmForm />
      </Suspense>
    </div>
  )
}
