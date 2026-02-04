'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Lazy load RevenueChart to reduce initial bundle size
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  loading: () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-400" size={32} />
    </div>
  ),
  ssr: false
})

interface Props {
  data: Array<{
    amount: number
    platform_fee: number
    created_at: string
  }>
}

export default function RevenueChartWrapper({ data }: Props) {
  return <RevenueChart data={data} />
}
