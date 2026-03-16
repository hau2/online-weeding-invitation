'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface AdminDashboardChartsProps {
  chartData: { date: string; count: number }[]
}

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  return `${parts[2]}/${parts[1]}`
}

export function AdminDashboardCharts({ chartData }: AdminDashboardChartsProps) {
  const formattedData = chartData.map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }))

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Thiep cuoi tao trong 30 ngay qua
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                }}
                labelFormatter={(label) => `Ngay: ${label}`}
                formatter={(value) => [String(value), 'Thiep cuoi']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6b7280"
                strokeWidth={2}
                dot={{ r: 2, fill: '#6b7280' }}
                activeDot={{ r: 4, fill: '#6b7280' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
