'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Calendar, MapPin, DollarSign, Users, Star, Briefcase,
  Clock, FileText, Edit, Eye
} from 'lucide-react'
import { getClientShifts, getClientStats } from '@/lib/api/shifts'
import { getPendingApplicationsCount } from '@/lib/api/applications'
import { ShiftStatusBadge } from '@/components/status/StatusBadge'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import type { Tables } from '@/lib/supabase-types'
import type { ShiftStatus } from '@/lib/types/status'

type Shift = Tables<'shifts'>
type TabStatus = 'open' | 'in_progress' | 'completed'

interface ClientStats {
  activeShifts: number
  totalPublished: number
  totalSpent: number
  averageRating: number
}

interface ShiftWithApplicationsCount extends Shift {
  applicationsCount: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const MOCK_CLIENT_ID = 'client-456'

  const [stats, setStats] = useState<ClientStats>({
    activeShifts: 0,
    totalPublished: 0,
    totalSpent: 0,
    averageRating: 0,
  })
  const [shifts, setShifts] = useState<ShiftWithApplicationsCount[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabStatus>('open')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadShiftsByStatus(activeTab)
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const result = await getClientStats(MOCK_CLIENT_ID)
      if (result.error) throw result.error
      if (result.data) {
        setStats(result.data)
      }
      await loadShiftsByStatus('open')
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadShiftsByStatus = async (status: TabStatus) => {
    try {
      const result = await getClientShifts(MOCK_CLIENT_ID, status)
      if (result.error) throw result.error

      const shiftsWithCounts = await Promise.all(
        (result.data || []).map(async (shift: Shift) => {
          const countResult = await getPendingApplicationsCount(shift.id)
          return {
            ...shift,
            applicationsCount: countResult.count || 0,
          }
        })
      )

      setShifts(shiftsWithCounts)
    } catch (err) {
      console.error('Error loading shifts:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return <LoadingScreen message="Загрузка панели..." />
  }

  const TabButton = ({ status, label }: { status: TabStatus; label: string }) => {
    const isActive = activeTab === status
    return (
      <button
        onClick={() => setActiveTab(status)}
        className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
          isActive
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`}
      >
        {label}
      </button>
    )
  }

  const StatCard = ({ icon: Icon, value, label, colorClass }: any) => (
    <div className={`${colorClass} backdrop-blur-xl rounded-2xl border ${colorClass.replace('/10', '/20')} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${colorClass.replace('/10', '/20')} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-').replace('/10', '-400')}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )

  const EmptyState = () => {
    const messages = {
      open: { title: 'Нет открытых смен', subtitle: 'Создайте свою первую смену, чтобы начать работу' },
      in_progress: { title: 'Нет смен в работе', subtitle: 'Одобренные смены появятся здесь' },
      completed: { title: 'Нет завершенных смен', subtitle: 'Завершенные смены появятся здесь' }
    }
    const message = messages[activeTab]

    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
        <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">{message.title}</h3>
        <p className="text-gray-400 mb-6">{message.subtitle}</p>
        {activeTab === 'open' && (
          <button
            onClick={() => router.push('/shifts/create')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all duration-200 active:scale-95 hover:shadow-lg shadow-lg shadow-orange-500/30"
          >
            Создать смену
          </button>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-dashboard">
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <h1 className="text-h1 text-white mb-1">Панель заказчика</h1>
          <p className="text-body-small text-gray-400">Управляйте своими сменами</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Clock} value={stats.activeShifts} label="Активных смен" colorClass="bg-orange-500/10" />
          <StatCard icon={FileText} value={stats.totalPublished} label="Всего опубликовано" colorClass="bg-blue-500/10" />
          <StatCard
            icon={DollarSign}
            value={`${stats.totalSpent.toLocaleString('ru-RU')} ₽`}
            label="Всего потрачено"
            colorClass="bg-green-500/10"
          />
          <StatCard
            icon={Star}
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            label="Средний рейтинг"
            colorClass="bg-yellow-500/10"
          />
        </div>

        <button
          onClick={() => router.push('/shifts/create')}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl text-white font-bold text-lg transition-all duration-200 active:scale-95 hover:shadow-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" />
          Создать смену
        </button>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <TabButton status="open" label="Открытые" />
          <TabButton status="in_progress" label="В работе" />
          <TabButton status="completed" label="Завершенные" />
        </div>

        <div>
          {shifts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer"
                  onClick={() => router.push(`/shift/${shift.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {shift.title}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                        {shift.category}
                      </span>
                    </div>
                    <ShiftStatusBadge status={shift.status as ShiftStatus} size="sm" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatDate(shift.date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{shift.location_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        {shift.pay_amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  {shift.applicationsCount > 0 && (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">
                          {shift.applicationsCount} {shift.applicationsCount === 1 ? 'отклик' : 'откликов'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/shifts/${shift.id}/applications`)
                      }}
                      className="flex-1 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-medium transition text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Отклики
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/shifts/${shift.id}/edit`)
                      }}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition text-sm flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Править
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => router.push('/shifts/create')}
        className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
    </main>
  )
}
