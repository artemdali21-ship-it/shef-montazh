'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ShiftCard from '@/components/shifts/ShiftCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface WorkerDashboardProps {
  userId: string
}

export default function WorkerDashboard({ userId }: WorkerDashboardProps) {
  const [stats, setStats] = useState({
    upcomingShifts: 0,
    completedShifts: 0,
    totalEarnings: 0,
    rating: 0
  })
  const [recentShifts, setRecentShifts] = useState<any[]>([])
  const [availableShifts, setAvailableShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await fetch(`/api/workers/${userId}/stats`)
      if (statsResponse.ok) {
        setStats(await statsResponse.json())
      }

      // Load recent shifts
      const shiftsResponse = await fetch(`/api/shifts?worker_id=${userId}&limit=3`)
      if (shiftsResponse.ok) {
        setRecentShifts(await shiftsResponse.json())
      }

      // Load available shifts
      const availableResponse = await fetch(`/api/shifts?status=published&limit=6`)
      if (availableResponse.ok) {
        setAvailableShifts(await availableResponse.json())
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка панели..." />
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📅"
          label="Предстоящие смены"
          value={stats.upcomingShifts.toString()}
          color="blue"
        />
        <StatCard
          icon="✅"
          label="Завершено смен"
          value={stats.completedShifts.toString()}
          color="green"
        />
        <StatCard
          icon="💰"
          label="Заработано"
          value={`${stats.totalEarnings.toLocaleString('ru-RU')} ₽`}
          color="yellow"
        />
        <StatCard
          icon="⭐"
          label="Рейтинг"
          value={stats.rating.toFixed(1)}
          color="purple"
        />
      </div>

      {/* Recent Shifts */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Мои смены</h2>
          <Link
            href="/worker/shifts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Все смены →
          </Link>
        </div>

        {recentShifts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600">У вас пока нет смен</p>
            <Link
              href="/shifts"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Найти смены
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} variant="my-shifts" />
            ))}
          </div>
        )}
      </section>

      {/* Available Shifts */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Доступные смены</h2>
          <Link
            href="/shifts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Все смены →
          </Link>
        </div>

        {availableShifts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600">Нет доступных смен</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
