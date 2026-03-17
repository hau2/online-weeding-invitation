'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, CheckCircle, DollarSign, HardDrive, Banknote, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatCard } from '@/components/admin/StatCard'
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts'
import { apiFetch } from '@/lib/api'
import type { AdminStats } from '@repo/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await apiFetch<AdminStats>('/admin/stats', {
        credentials: 'include',
      })
      if (error) {
        toast.error(error)
      }
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#181113]">Tong quan he thong</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-[#ec1349]" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#181113]">Tong quan he thong</h1>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Tong nguoi dung"
          value={stats?.totalUsers ?? '\u2014'}
          icon={Users}
          iconColorClass="bg-blue-500"
        />
        <StatCard
          title="Tong thiep cuoi"
          value={stats?.totalInvitations ?? '\u2014'}
          icon={FileText}
          iconColorClass="bg-[#ec1349]"
        />
        <StatCard
          title="Da xuat ban"
          value={stats?.publishedInvitations ?? '\u2014'}
          icon={CheckCircle}
          iconColorClass="bg-green-500"
        />
        <StatCard
          title="Premium"
          value={stats?.premiumInvitations ?? '\u2014'}
          icon={DollarSign}
          iconColorClass="bg-amber-500"
        />
        <StatCard
          title="Doanh thu"
          value={stats ? `${new Intl.NumberFormat('vi-VN').format(stats.revenueTotal)} d` : '\u2014'}
          icon={Banknote}
          iconColorClass="bg-purple-500"
        />
        <StatCard
          title="Dung luong"
          value={stats ? `${stats.storageEstimateMb} MB` : '\u2014'}
          icon={HardDrive}
          iconColorClass="bg-cyan-500"
        />
      </div>

      {/* Charts area */}
      <AdminDashboardCharts chartData={stats?.chartData ?? []} />
    </div>
  )
}
