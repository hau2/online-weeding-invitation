import { LucideIcon, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColorClass?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, iconColorClass, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-[#e6dbde] p-6 flex flex-col gap-4 shadow-sm',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#89616b] font-medium">{title}</p>
          <p className="text-3xl font-bold text-[#181113] mt-1">{value}</p>
          {description && <p className="text-xs text-[#89616b] mt-1">{description}</p>}
        </div>
        <div className={cn(
          'size-10 rounded-lg flex items-center justify-center flex-shrink-0',
          iconColorClass || 'bg-[#f4f0f1]'
        )}>
          <Icon className={cn('size-5', iconColorClass ? 'text-white' : 'text-[#89616b]')} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-[#89616b]">
          <TrendingUp className="size-3 text-green-500" />
          <span className="text-green-600 font-medium">{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
