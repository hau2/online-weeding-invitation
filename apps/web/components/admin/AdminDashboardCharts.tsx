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
      <div className="bg-white rounded-xl border border-[#e6dbde] p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#89616b] mb-4">
          Thiep cuoi tao trong 30 ngay qua
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6dbde" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#89616b' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#89616b' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: '1px solid #e6dbde',
                  boxShadow: '0 4px 12px rgba(24, 17, 19, 0.08)',
                }}
                labelFormatter={(label) => `Ngay: ${label}`}
                formatter={(value) => [String(value), 'Thiep cuoi']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ec1349"
                strokeWidth={2}
                dot={{ r: 2, fill: '#ec1349' }}
                activeDot={{ r: 4, fill: '#ec1349' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
