import { createServerClient as createClient } from '@/lib/supabase-server'
import { DollarSign, TrendingUp, ArrowUpRight, Download } from 'lucide-react'
import RevenueChartWrapper from '@/components/admin/RevenueChartWrapper'
import TransactionsTable from '@/components/admin/TransactionsTable'
import ExportButton from '@/components/admin/ExportButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getFinanceStats() {
  const supabase = createClient()

  try {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, platform_fee, created_at, status')
      .eq('status', 'paid')

    if (!payments || payments.length === 0) {
      return {
        totalRevenue: 0,
        totalFees: 0,
        totalPayouts: 0,
        payments: []
      }
    }

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalFees = payments.reduce((sum, p) => sum + Number(p.platform_fee), 0)
    const totalPayouts = payments.reduce((sum, p) => sum + (Number(p.amount) - Number(p.platform_fee)), 0)

    return {
      totalRevenue,
      totalFees,
      totalPayouts,
      payments
    }
  } catch (error) {
    console.error('Error fetching finance stats:', error)
    return {
      totalRevenue: 0,
      totalFees: 0,
      totalPayouts: 0,
      payments: []
    }
  }
}

export default async function AdminFinancePage() {
  const stats = await getFinanceStats()

  const cards = [
    {
      label: 'Общая выручка',
      value: `${(stats.totalRevenue / 1000).toFixed(0)}k ₽`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'green-500/20'
    },
    {
      label: 'Комиссии платформы',
      value: `${(stats.totalFees / 1000).toFixed(0)}k ₽`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'orange-500/20'
    },
    {
      label: 'Выплачено исполнителям',
      value: `${(stats.totalPayouts / 1000).toFixed(0)}k ₽`,
      icon: ArrowUpRight,
      color: 'blue',
      bgColor: 'blue-500/20'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Финансы</h1>
          <p className="text-gray-400">Детальная финансовая отчётность платформы</p>
        </div>

        <ExportButton payments={stats.payments} />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition"
            >
              <div className={`w-12 h-12 bg-${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} className={`text-${card.color}-400`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChartWrapper data={stats.payments} />
      </div>

      {/* Transactions Table */}
      <TransactionsTable />
    </div>
  )
}
