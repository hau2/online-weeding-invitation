import { cn } from '@/lib/utils'
import type { InvitationStatus } from '@repo/types'

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string; label: string }> = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
    border: 'border-gray-200',
    label: 'Bản nháp',
  },
  published: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-600',
    border: 'border-green-200',
    label: 'Đang chạy',
  },
  save_the_date: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-600',
    border: 'border-teal-200',
    label: 'Save the Date',
  },
  expired: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-500',
    border: 'border-red-200',
    label: 'Hết hạn',
  },
}

interface StatusBadgeProps {
  status: InvitationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
