'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PlatformStats() {
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?period=${period}`)
      if (response.ok) {
        setStats(await response.json())
      }
    } catch (error) {
      console.error('Error loading platform stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка статистики платформы..." />
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Не удалось загрузить статистику
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'all'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p === 'today' ? 'Сегодня' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Все время'}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Пользователи"
          value={stats.totalUsers || 0}
          change={stats.usersGrowth}
          color="blue"
        />
        <StatCard
          icon="📋"
          label="Смены"
          value={stats.totalShifts || 0}
          change={stats.shiftsGrowth}
          color="green"
        />
        <StatCard
          icon="💰"
          label="Оборот"
          value={`${(stats.totalRevenue || 0).toLocaleString('ru-RU')} ₽`}
          change={stats.revenueGrowth}
          color="yellow"
        />
        <StatCard
          icon="💎"
          label="Прибыль"
          value={`${(stats.platformFees || 0).toLocaleString('ru-RU')} ₽`}
          change={stats.feesGrowth}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Пользователи</h3>
          <div className="space-y-3">
            <StatRow
              label="Работники"
              value={stats.totalWorkers || 0}
              icon="🔧"
            />
            <StatRow
              label="Заказчики"
              value={stats.totalClients || 0}
              icon="🏢"
            />
            <StatRow
              label="Шефы"
              value={stats.totalShefs || 0}
              icon="👨‍💼"
            />
            <StatRow
              label="Админы"
              value={stats.totalAdmins || 0}
              icon="⚙️"
            />
          </div>
        </div>

        {/* Shifts Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Смены</h3>
          <div className="space-y-3">
            <StatRow
              label="Активные"
              value={stats.activeShifts || 0}
              icon="⚡"
              color="blue"
            />
            <StatRow
              label="В работе"
              value={stats.inProgressShifts || 0}
              icon="🔄"
              color="yellow"
            />
            <StatRow
              label="Завершенные"
              value={stats.completedShifts || 0}
              icon="✅"
              color="green"
            />
            <StatRow
              label="Отмененные"
              value={stats.cancelledShifts || 0}
              icon="❌"
              color="red"
            />
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Платежи</h3>
          <div className="space-y-3">
            <StatRow
              label="Успешные"
              value={`${(stats.successfulPayments || 0).toLocaleString('ru-RU')} ₽`}
              icon="✅"
              color="green"
            />
            <StatRow
              label="В обработке"
              value={`${(stats.pendingPayments || 0).toLocaleString('ru-RU')} ₽`}
              icon="⏳"
              color="yellow"
            />
            <StatRow
              label="Отклоненные"
              value={`${(stats.failedPayments || 0).toLocaleString('ru-RU')} ₽`}
              icon="❌"
              color="red"
            />
            <StatRow
              label="Возвраты"
              value={`${(stats.refundedPayments || 0).toLocaleString('ru-RU')} ₽`}
              icon="↩️"
              color="gray"
            />
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Активность</h3>
          <div className="space-y-3">
            <StatRow
              label="Заявки"
              value={stats.totalApplications || 0}
              icon="📝"
            />
            <StatRow
              label="Принято заявок"
              value={stats.acceptedApplications || 0}
              icon="✓"
              color="green"
            />
            <StatRow
              label="Отзывы"
              value={stats.totalReviews || 0}
              icon="⭐"
            />
            <StatRow
              label="Ср. рейтинг"
              value={stats.avgRating?.toFixed(1) || '0.0'}
              icon="📊"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  change,
  color
}: {
  icon: string
  label: string
  value: string | number
  change?: number
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{label}</div>
        {change !== undefined && (
          <div
            className={`text-sm font-medium ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {change > 0 && '+'}{change}%
          </div>
        )}
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  icon,
  color
}: {
  label: string
  value: string | number
  icon: string
  color?: string
}) {
  const textColor = color
    ? `text-${color}-600`
    : 'text-gray-900'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-700">{label}</span>
      </div>
      <span className={`font-semibold ${textColor}`}>{value}</span>
    </div>
  )
}
