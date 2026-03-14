import { LucideIcon, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="size-5 text-gray-600" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <TrendingUp className="size-3 text-green-500" />
          <span className="text-green-600 font-medium">{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
