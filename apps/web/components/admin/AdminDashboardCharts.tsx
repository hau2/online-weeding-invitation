'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const PLACEHOLDER_DATA = [
  { month: 'T1', invitations: 0 },
  { month: 'T2', invitations: 0 },
  { month: 'T3', invitations: 0 },
  { month: 'T4', invitations: 0 },
  { month: 'T5', invitations: 0 },
  { month: 'T6', invitations: 0 },
]

export function AdminDashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Invitations over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Thiệp cưới theo tháng</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PLACEHOLDER_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="invitations" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Dữ liệu thực tế sẽ có ở Phase 8</p>
      </div>

      {/* Revenue placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo tháng</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-400">Biểu đồ doanh thu -- Phase 8</p>
        </div>
      </div>
    </div>
  )
}
