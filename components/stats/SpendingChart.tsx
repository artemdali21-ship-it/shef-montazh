'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase-client'

interface SpendingData {
  month: string
  amount: number
}

export default function SpendingChart({ userId }: { userId: string }) {
  const supabase = createClient()
  const [data, setData] = useState<SpendingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpendingData()
  }, [userId])

  const loadSpendingData = async () => {
    try {
      // Get all completed shifts with payments
      const { data: shifts, error } = await supabase
        .from('shifts')
        .select('id, date, price')
        .eq('client_id', userId)
        .eq('status', 'completed')
        .order('date', { ascending: true })

      if (error) throw error

      // Group by month
      const monthlySpending: { [key: string]: number } = {}
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      const now = new Date()

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        monthlySpending[monthKey] = 0
      }

      // Aggregate spending
      shifts?.forEach(shift => {
        const shiftDate = new Date(shift.date)
        const monthKey = `${monthNames[shiftDate.getMonth()]} ${shiftDate.getFullYear()}`
        if (monthlySpending.hasOwnProperty(monthKey)) {
          monthlySpending[monthKey] += shift.price || 0
        }
      })

      const chartData = Object.entries(monthlySpending).map(([month, amount]) => ({
        month,
        amount
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error loading spending data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Расходы по месяцам</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-gray-400">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Расходы по месяцам</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Расходы']}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
