'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Tạo tài khoản thành công!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="ten@example.com" {...register('email')} />
        {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" placeholder="Ít nhất 8 ký tự" {...register('password')} />
        {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </Button>
    </form>
  )
}
