'use client'
import { Zap } from 'lucide-react'

interface AgentQuotaBarProps {
  published: number
  limit: number
  daysRemaining: number | null
  subscriptionEnd: string | null
}

export function AgentQuotaBar({ published, limit, daysRemaining, subscriptionEnd }: AgentQuotaBarProps) {
  const pct = Math.min((published / limit) * 100, 100)
  const isExpired = subscriptionEnd ? new Date(subscriptionEnd) < new Date() : false
  const isNearLimit = published >= limit - 2

  return (
    <div className="bg-white p-5 rounded-xl border border-[#e6dbde] shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
            <Zap className="size-4" />
          </div>
          <p className="text-[#5e4d52] text-sm font-medium">Quota thang nay</p>
        </div>
        {isExpired ? (
          <span className="text-xs font-medium text-[#ec1349]">Het han</span>
        ) : (
          <span className="text-xs text-[#89616b]">
            {daysRemaining != null ? `${daysRemaining} ngay con lai` : ''}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold mb-3 ${isNearLimit ? 'text-[#ec1349]' : 'text-[#181113]'}`}>
        {published}/{limit} <span className="text-sm font-medium text-[#89616b]">thiep da xuat ban</span>
      </p>
      <div className="w-full h-2 bg-[#f4f0f1] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-[#ec1349]' : 'bg-gradient-to-r from-[#ec1349] to-[#ff6b8a]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
