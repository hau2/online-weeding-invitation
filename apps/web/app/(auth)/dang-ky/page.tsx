import { RegisterForm } from '@/components/auth/register-form'

export const metadata = { title: 'Đăng ký — Thiệp Cưới Online' }

export default function DangKyPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-bold text-[#181113]">Tạo tài khoản mới</h3>
        <p className="text-[#89616b] text-sm mt-1">
          Bắt đầu hành trình tạo thiệp cưới miễn phí.
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
