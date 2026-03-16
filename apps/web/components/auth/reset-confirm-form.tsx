'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type { MessageResponse } from '@repo/types'

const schema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export function ResetConfirmForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error('Liên kết không hợp lệ. Vui lòng yêu cầu lại.')
      return
    }

    const { error } = await apiFetch<MessageResponse>('/auth/confirm-reset', {
      method: 'POST',
      body: { token, newPassword: values.newPassword },
    })

    if (error) {
      toast.error(error)
      return
    }

    toast.success('Mật khẩu đã được cập nhật')
    setTimeout(() => router.push('/dang-nhap'), 1500)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Mật khẩu mới</span>
        <input
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-sm text-[#ec1349]">{errors.newPassword.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Xác nhận mật khẩu mới</span>
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-[#ec1349]">{errors.confirmPassword.message}</p>
        )}
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-[#ec1349] hover:bg-[#c90e3c] active:scale-[0.99] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </button>
    </form>
  )
}
