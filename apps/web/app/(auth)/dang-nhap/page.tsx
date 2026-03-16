import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Đăng nhập — Thiệp Cưới Online' }

export default function DangNhapPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-bold text-[#181113]">Chào mừng trở lại!</h3>
        <p className="text-[#89616b] text-sm mt-1">
          Vui lòng đăng nhập để quản lý thiệp cưới của bạn.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
