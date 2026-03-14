'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import type { MessageResponse } from '@repo/types'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type FormValues = z.infer<typeof schema>

export function ResetRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const { error } = await apiFetch<MessageResponse>('/auth/request-reset', {
      method: 'POST',
      body: { email: values.email },
    })

    if (error) {
      toast.error(error)
      return
    }

    toast.success('Kiểm tra email của bạn để đặt lại mật khẩu')
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="ten@example.com"
          disabled={submitted}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
      </div>
      <Button
        type="submit"
        className="w-full bg-rose-500 hover:bg-rose-600 text-white"
        disabled={isSubmitting || submitted}
      >
        {isSubmitting ? 'Đang gửi...' : submitted ? 'Đã gửi email' : 'Gửi liên kết đặt lại'}
      </Button>
    </form>
  )
}
