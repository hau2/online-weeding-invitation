import { Users, FileText, CheckCircle, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts'

const PLACEHOLDER_STATS = [
  {
    title: 'Tổng người dùng',
    value: '\u2014',
    description: 'Phase 8 sẽ hiển thị số thực',
    icon: Users,
  },
  {
    title: 'Tổng thiệp cưới',
    value: '\u2014',
    description: 'Phase 8 sẽ hiển thị số thực',
    icon: FileText,
  },
  {
    title: 'Đang hoạt động',
    value: '\u2014',
    description: 'Thiệp đã xuất bản',
    icon: CheckCircle,
  },
  {
    title: 'Doanh thu',
    value: '\u2014',
    description: 'Tổng doanh thu',
    icon: DollarSign,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">Dữ liệu thực tế sẽ được kết nối tại Phase 8</p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts area */}
      <AdminDashboardCharts />
    </div>
  )
}
