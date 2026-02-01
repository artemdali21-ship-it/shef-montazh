import { createClient } from '@/lib/supabase-server'
import { Users, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'

async function getStats() {
  const supabase = createClient()

  try {
    // Get users count
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get shifts count
    const { count: shiftsCount } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })

    // Get shifts by status
    const { count: openShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    const { count: completedShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Get payments data
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status')

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const successfulPayments = payments?.filter(p => p.status === 'succeeded').length || 0
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0

    // Calculate growth (mock for now)
    const growth = '+24%'

    return {
      users: usersCount || 0,
      shifts: shiftsCount || 0,
      openShifts: openShifts || 0,
      completedShifts: completedShifts || 0,
      revenue: totalRevenue,
      successfulPayments,
      pendingPayments,
      growth
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      users: 0,
      shifts: 0,
      openShifts: 0,
      completedShifts: 0,
      revenue: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      growth: '0%'
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const mainCards = [
    {
      label: 'Всего пользователей',
      value: stats.users.toLocaleString('ru-RU'),
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Смен создано',
      value: stats.shifts.toLocaleString('ru-RU'),
      icon: Calendar,
      color: 'green'
    },
    {
      label: 'Общий оборот',
      value: `${(stats.revenue / 1000).toFixed(0)}k ₽`,
      icon: DollarSign,
      color: 'orange'
    },
    {
      label: 'Рост',
      value: stats.growth,
      icon: TrendingUp,
      color: 'purple'
    }
  ]

  const detailCards = [
    {
      label: 'Открытые смены',
      value: stats.openShifts,
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Завершённые смены',
      value: stats.completedShifts,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Успешные платежи',
      value: stats.successfulPayments,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Ожидают оплаты',
      value: stats.pendingPayments,
      icon: Clock,
      color: 'yellow'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Обзор основных метрик платформы</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${card.color}-500/20 rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className={`text-${card.color}-400`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Детальная статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {detailCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.label}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 bg-${card.color}-500/20 rounded-lg flex items-center justify-center`}>
                    <Icon size={16} className={`text-${card.color}-400`} />
                  </div>
                  <span className="text-xs text-gray-400">{card.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {card.value}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Последняя активность</h2>
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Активность будет отображаться здесь</p>
        </div>
      </div>
    </div>
  )
}
