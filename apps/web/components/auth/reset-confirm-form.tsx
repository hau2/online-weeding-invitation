'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input id="newPassword" type="password" placeholder="Ít nhất 8 ký tự" {...register('newPassword')} />
        {errors.newPassword && <p className="text-sm text-rose-600">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </Button>
    </form>
  )
}
