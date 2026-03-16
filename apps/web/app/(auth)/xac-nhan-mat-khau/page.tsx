import { Suspense } from 'react'
import { ResetConfirmForm } from '@/components/auth/reset-confirm-form'

export const metadata = { title: 'Xác nhận mật khẩu mới — Thiệp Cưới Online' }

export default function XacNhanMatKhauPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-bold text-[#181113]">Đặt mật khẩu mới</h3>
        <p className="text-[#89616b] text-sm mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>
      <Suspense fallback={<div className="text-center text-[#89616b] py-4">Đang tải...</div>}>
        <ResetConfirmForm />
      </Suspense>
    </div>
  )
}
