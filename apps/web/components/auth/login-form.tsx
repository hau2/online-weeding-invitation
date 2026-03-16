'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { loginAction } from '@/lib/auth'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const result = await loginAction(values.email, values.password)
    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Email field */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#181113]">Email</span>
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
              placeholder="Nhập mật khẩu"
              className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-[#ec1349]">{errors.password.message}</p>
          )}
        </label>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#e6dbde] text-[#ec1349] focus:ring-[#ec1349]/20"
            />
            <span className="text-sm text-[#89616b]">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/dat-lai-mat-khau"
            className="text-sm font-semibold text-[#ec1349] hover:text-[#c90e3c] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#ec1349] hover:bg-[#c90e3c] active:scale-[0.99] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}</span>
          {!isSubmitting && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e6dbde]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-[#89616b]">Hoặc tiếp tục với</span>
        </div>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-10 border border-[#e6dbde] rounded-lg hover:bg-[#f8f6f6] transition-colors font-medium text-sm text-[#181113]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-10 border border-[#e6dbde] rounded-lg hover:bg-[#f8f6f6] transition-colors font-medium text-sm text-[#181113]"
        >
          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </>
  )
}
