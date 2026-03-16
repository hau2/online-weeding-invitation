'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#181113]">Email</span>
        <div className="relative">
          <input
            type="email"
            placeholder="nhapemailcuaban@gmail.com"
            disabled={submitted}
            className="w-full h-12 rounded-lg border border-[#e6dbde] bg-white px-4 text-base text-[#181113] placeholder:text-[#89616b]/60 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
      <button
        type="submit"
        disabled={isSubmitting || submitted}
        className="w-full h-12 bg-[#ec1349] hover:bg-[#c90e3c] active:scale-[0.99] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Đang gửi...' : submitted ? 'Đã gửi email' : 'Gửi liên kết đặt lại'}
      </button>
    </form>
  )
}
