'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalClients: 0,
    totalShifts: 0,
    activeShifts: 0,
    completedShifts: 0,
    totalPayments: 0,
    platformRevenue: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error('Error loading admin dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка панели администратора..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Панель администратора</h1>
        <p className="opacity-90">Общая статистика платформы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Всего пользователей"
          value={stats.totalUsers.toString()}
          color="blue"
        />
        <StatCard
          icon="🔧"
          label="Работников"
          value={stats.totalWorkers.toString()}
          color="green"
        />
        <StatCard
          icon="🏢"
          label="Заказчиков"
          value={stats.totalClients.toString()}
          color="purple"
        />
        <StatCard
          icon="📋"
          label="Всего смен"
          value={stats.totalShifts.toString()}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="⚡"
          label="Активные смены"
          value={stats.activeShifts.toString()}
          color="blue"
        />
        <StatCard
          icon="✅"
          label="Завершенные"
          value={stats.completedShifts.toString()}
          color="green"
        />
        <StatCard
          icon="💰"
          label="Платежи"
          value={`${stats.totalPayments.toLocaleString('ru-RU')} ₽`}
          color="yellow"
        />
        <StatCard
          icon="💎"
          label="Доход платформы"
          value={`${stats.platformRevenue.toLocaleString('ru-RU')} ₽`}
          color="purple"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink
          href="/admin/users"
          icon="👥"
          title="Управление пользователями"
          description="Просмотр и модерация пользователей"
          color="blue"
        />
        <QuickLink
          href="/admin/shifts"
          icon="📋"
          title="Управление сменами"
          description="Просмотр и модерация смен"
          color="green"
        />
        <QuickLink
          href="/admin/payments"
          icon="💳"
          title="Платежи"
          description="История и статистика платежей"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Последняя активность</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Нет активности
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{activity.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

function QuickLink({ href, icon, title, description, color }: { href: string; icon: string; title: string; description: string; color: string }) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
  }

  return (
    <Link
      href={href}
      className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${colorClasses[color]}`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
