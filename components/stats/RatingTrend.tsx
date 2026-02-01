'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Star } from 'lucide-react'

interface RatingData {
  date: string
  rating: number
}

interface Props {
  data: RatingData[]
  currentRating: number
}

export default function RatingTrend({ data, currentRating }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Динамика рейтинга</h3>
        <div className="flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" size={20} />
          <span className="text-2xl font-bold text-white">{currentRating.toFixed(1)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [value.toFixed(1), 'Рейтинг']}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#eab308"
            strokeWidth={3}
            dot={{ fill: '#eab308', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
