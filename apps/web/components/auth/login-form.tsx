'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="ten@example.com" {...register('email')} />
        {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mật khẩu</Label>
          <Link href="/dat-lai-mat-khau" className="text-xs text-rose-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <Input id="password" type="password" placeholder="Nhập mật khẩu" {...register('password')} />
        {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky" className="text-rose-600 hover:underline font-medium">
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
