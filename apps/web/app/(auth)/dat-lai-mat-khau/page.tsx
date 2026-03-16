import { ResetRequestForm } from '@/components/auth/reset-request-form'
import Link from 'next/link'

export const metadata = { title: 'Đặt lại mật khẩu — Thiệp Cưới Online' }

export default function DatLaiMatKhauPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-bold text-[#181113]">Đặt lại mật khẩu</h3>
        <p className="text-[#89616b] text-sm mt-1">Nhập email để nhận liên kết đặt lại mật khẩu</p>
      </div>
      <ResetRequestForm />
      <p className="text-center text-sm text-[#89616b]">
        <Link href="/dang-nhap" className="text-[#ec1349] font-semibold hover:text-[#c90e3c] hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}
