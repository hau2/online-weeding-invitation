'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { registerAction } from '@/lib/auth'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const result = await registerAction(values.email, values.password)
    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Email field */}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Email đăng ký</span>
        <div className="relative">
          <input
            type="email"
            placeholder="nhapemailcuaban@gmail.com"
            className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
            {...register('email')}
          />
          <svg
            className="absolute right-4 top-3.5 w-5 h-5 text-[#89616b] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        {errors.email && (
          <p className="text-sm text-[#ec1349]">{errors.email.message}</p>
        )}
      </label>

      {/* Password field */}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Mật khẩu</span>
        <div className="relative">
          <input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-[#ec1349]">{errors.password.message}</p>
        )}
      </label>

      {/* Confirm password field */}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Xác nhận mật khẩu</span>
        <div className="relative">
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-[#ec1349]">{errors.confirmPassword.message}</p>
        )}
      </label>

      {/* Terms checkbox */}
      <div className="flex items-start gap-2 mt-1">
        <input
          type="checkbox"
          id="terms"
          className="mt-1 w-4 h-4 rounded border-[#e6dbde] text-[#ec1349] focus:ring-[#ec1349]/20"
        />
        <label className="text-xs text-[#89616b] leading-normal" htmlFor="terms">
          Tôi đồng ý với{' '}
          <a href="#" className="text-[#ec1349] font-semibold hover:underline">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#" className="text-[#ec1349] font-semibold hover:underline">
            Chính sách bảo mật
          </a>{' '}
          của WeddingConnect.
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-[#ec1349] hover:bg-[#c90e3c] active:scale-[0.99] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
        {!isSubmitting && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
        )}
      </button>
    </form>
  )
}
