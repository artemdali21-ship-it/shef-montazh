'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShiftCard from '@/components/shifts/ShiftCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ClientDashboardProps {
  userId: string
}

export default function ClientDashboard({ userId }: ClientDashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState({
    activeShifts: 0,
    totalApplications: 0,
    completedShifts: 0,
    totalSpent: 0
  })
  const [myShifts, setMyShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await fetch(`/api/clients/${userId}/stats`)
      if (statsResponse.ok) {
        setStats(await statsResponse.json())
      }

      // Load my shifts
      const shiftsResponse = await fetch(`/api/shifts?client_id=${userId}&limit=6`)
      if (shiftsResponse.ok) {
        setMyShifts(await shiftsResponse.json())
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
      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Добро пожаловать!</h2>
        <p className="mb-4 opacity-90">Создайте смену и найдите работников для вашего мероприятия</p>
        <button
          onClick={() => router.push('/client/shifts/create')}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          ➕ Создать смену
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📋"
          label="Активные смены"
          value={stats.activeShifts.toString()}
          color="blue"
        />
        <StatCard
          icon="👥"
          label="Заявки"
          value={stats.totalApplications.toString()}
          color="purple"
        />
        <StatCard
          icon="✅"
          label="Завершено"
          value={stats.completedShifts.toString()}
          color="green"
        />
        <StatCard
          icon="💳"
          label="Потрачено"
          value={`${stats.totalSpent.toLocaleString('ru-RU')} ₽`}
          color="yellow"
        />
      </div>

      {/* My Shifts */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Мои смены</h2>
          <Link
            href="/client/shifts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Все смены →
          </Link>
        </div>

        {myShifts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              У вас пока нет смен
            </h3>
            <p className="text-gray-600 mb-6">
              Создайте свою первую смену, чтобы найти работников
            </p>
            <button
              onClick={() => router.push('/client/shifts/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Создать смену
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} variant="my-shifts" />
              ))}
            </div>

            {/* Shifts with Applications Alert */}
            {stats.totalApplications > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📬</span>
                  <div>
                    <div className="font-semibold text-yellow-900">
                      У вас {stats.totalApplications} новых заявок
                    </div>
                    <div className="text-sm text-yellow-700">
                      Не забудьте проверить и одобрить кандидатов
                    </div>
                  </div>
                </div>
                <Link
                  href="/client/shifts"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Посмотреть
                </Link>
              </div>
            )}
          </>
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
