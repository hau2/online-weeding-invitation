import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badge = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        draft: 'bg-gray-100 text-gray-600',
        published: 'bg-green-100 text-green-700',
        expired: 'bg-red-100 text-red-600',
      },
    },
    defaultVariants: { status: 'draft' },
  }
)

const LABELS: Record<string, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  expired: 'Hết hạn',
}

interface StatusBadgeProps extends VariantProps<typeof badge> {
  status: 'draft' | 'published' | 'expired'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(badge({ status }), className)}>
      {LABELS[status]}
    </span>
  )
}
