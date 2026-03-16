'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, CheckCircle, DollarSign, HardDrive, Loader2 } from 'lucide-react'
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
          <h1 className="text-2xl font-semibold text-gray-900">Tong quan he thong</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tong quan he thong</h1>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Tong nguoi dung"
          value={stats?.totalUsers ?? '\u2014'}
          icon={Users}
        />
        <StatCard
          title="Tong thiep cuoi"
          value={stats?.totalInvitations ?? '\u2014'}
          icon={FileText}
        />
        <StatCard
          title="Da xuat ban"
          value={stats?.publishedInvitations ?? '\u2014'}
          icon={CheckCircle}
        />
        <StatCard
          title="Premium"
          value={stats?.premiumInvitations ?? '\u2014'}
          icon={DollarSign}
        />
        <StatCard
          title="Dung luong"
          value={stats ? `${stats.storageEstimateMb} MB` : '\u2014'}
          icon={HardDrive}
        />
      </div>

      {/* Charts area */}
      <AdminDashboardCharts chartData={stats?.chartData ?? []} />
    </div>
  )
}
