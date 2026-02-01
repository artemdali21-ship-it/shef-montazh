'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface Props {
  data: Array<{
    amount: number
    platform_fee: number
    created_at: string
  }>
}

export default function RevenueChart({ data }: Props) {
  // Group by month
  const monthlyData = data.reduce((acc: any, payment) => {
    const date = new Date(payment.created_at)
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    const month = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

    if (!acc[month]) {
      acc[month] = { revenue: 0, fees: 0 }
    }

    acc[month].revenue += payment.amount
    acc[month].fees += payment.platform_fee

    return acc
  }, {})

  const chartData = Object.entries(monthlyData).map(([month, values]: [string, any]) => ({
    month,
    revenue: values.revenue,
    fees: values.fees
  }))

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        Выручка по месяцам
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Legend
            wrapperStyle={{ color: 'white' }}
            formatter={(value) => <span className="text-white text-sm">{value}</span>}
          />
          <Bar dataKey="revenue" fill="#10B981" name="Выручка" radius={[8, 8, 0, 0]} />
          <Bar dataKey="fees" fill="#E85D2F" name="Комиссия" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
