'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface UserStatsProps {
  userId: string
  role: 'worker' | 'client'
}

export default function UserStats({ userId, role }: UserStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    setLoading(true)
    try {
      const endpoint = role === 'worker'
        ? `/api/workers/${userId}/stats`
        : `/api/clients/${userId}/stats`

      const response = await fetch(endpoint)
      if (response.ok) {
        setStats(await response.json())
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Загрузка статистики..." />
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Не удалось загрузить статистику
      </div>
    )
  }

  return (
    <div>
      {role === 'worker' ? (
        <WorkerStatsView stats={stats} />
      ) : (
        <ClientStatsView stats={stats} />
      )}
    </div>
  )
}

function WorkerStatsView({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon="⭐"
        label="Рейтинг"
        value={stats.rating?.toFixed(1) || '0.0'}
        color="yellow"
        subtext={`${stats.totalReviews || 0} отзывов`}
      />
      <StatCard
        icon="✅"
        label="Завершено смен"
        value={stats.completedShifts || 0}
        color="green"
      />
      <StatCard
        icon="💰"
        label="Заработано"
        value={`${(stats.totalEarnings || 0).toLocaleString('ru-RU')} ₽`}
        color="blue"
      />
      <StatCard
        icon="📅"
        label="Предстоящие"
        value={stats.upcomingShifts || 0}
        color="purple"
      />
    </div>
  )
}

function ClientStatsView({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon="📋"
        label="Активные смены"
        value={stats.activeShifts || 0}
        color="blue"
      />
      <StatCard
        icon="✅"
        label="Завершено"
        value={stats.completedShifts || 0}
        color="green"
      />
      <StatCard
        icon="💳"
        label="Потрачено"
        value={`${(stats.totalSpent || 0).toLocaleString('ru-RU')} ₽`}
        color="yellow"
      />
      <StatCard
        icon="👥"
        label="Заявки"
        value={stats.totalApplications || 0}
        color="purple"
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  subtext
}: {
  icon: string
  label: string
  value: string | number
  color: string
  subtext?: string
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
      <div className="text-sm text-gray-600">{label}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )
}
