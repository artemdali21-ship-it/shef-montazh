'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, DollarSign, Star, Calendar, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

// Lazy load chart components to reduce initial bundle size
const EarningsChart = dynamic(() => import('@/components/stats/EarningsChart'), {
  loading: () => <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-orange-400" size={32} /></div>,
  ssr: false
})
const ShiftsBreakdown = dynamic(() => import('@/components/stats/ShiftsBreakdown'), { ssr: false })
const RatingTrend = dynamic(() => import('@/components/stats/RatingTrend'), { ssr: false })

interface StatsData {
  totalShifts: number
  totalEarnings: number
  avgRating: number
  growthPercentage: number
  monthlyEarnings: { month: string; amount: number }[]
  categoryBreakdown: { name: string; value: number; color: string }[]
  ratingTrend: { date: string; rating: number }[]
  topClients: { name: string; shifts: number; earnings: number }[]
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Монтаж': '#f97316',
  'Демонтаж': '#3b82f6',
  'Отделка': '#10b981',
  'Сантехника': '#f59e0b',
  'Электрика': '#8b5cf6',
  'Другое': '#ec4899'
}

export default function WorkerStatsPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()
  const { session, loading: sessionLoading } = useTelegramSession()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadStats()
    } else if (!sessionLoading && !session) {
      console.log('[Stats] No session available')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, session?.userId])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Check Telegram session
      if (!session) {
        console.log('[Stats] No session, redirecting to home')
        router.push('/')
        return
      }

      console.log('[Stats] Loading stats for user:', session.userId)

      // Fetch all completed shifts for the worker
      const { data: assignments, error: shiftsError } = await supabase
        .from('shift_assignments')
        .select(`
          *,
          shift:shifts (
            id,
            title,
            category,
            pay_amount,
            date,
            client_id
          )
        `)
        .eq('worker_id', session.userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      console.log('[Stats] Assignments fetched:', assignments?.length || 0)

      if (shiftsError) {
        console.error('[Stats] Error fetching shifts:', shiftsError)
        toast.error(`Ошибка загрузки: ${shiftsError.message}`)
        // Set empty stats on error
        setStats({
          totalShifts: 0,
          totalEarnings: 0,
          avgRating: 0,
          growthPercentage: 0,
          monthlyEarnings: [],
          categoryBreakdown: [],
          ratingTrend: [],
          topClients: []
        })
        setLoading(false)
        return
      }

      // Fetch client names separately
      const shifts = await Promise.all((assignments || []).map(async (assignment) => {
        if (assignment.shift?.client_id) {
          const { data: client } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('id', assignment.shift.client_id)
            .single()

          return {
            ...assignment,
            shift: {
              ...assignment.shift,
              price: assignment.shift.pay_amount,
              client
            }
          }
        }
        return {
          ...assignment,
          shift: {
            ...assignment.shift,
            price: assignment.shift.pay_amount
          }
        }
      }))

      if (!shifts || shifts.length === 0) {
        setStats({
          totalShifts: 0,
          totalEarnings: 0,
          avgRating: 0,
          growthPercentage: 0,
          monthlyEarnings: [],
          categoryBreakdown: [],
          ratingTrend: [],
          topClients: []
        })
        return
      }

      // Calculate total shifts and earnings
      const totalShifts = shifts.length
      const totalEarnings = shifts.reduce((sum, s) => sum + (s.shift?.price || 0), 0)

      // Get worker profile rating
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('rating')
        .eq('user_id', session.userId)
        .single()

      const avgRating = workerProfile?.rating || 0
      const ratingsData: any[] = [] // No individual ratings for now

      // Calculate growth percentage (compare last 30 days vs previous 30 days)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const recentShifts = shifts.filter(s =>
        new Date(s.created_at) >= thirtyDaysAgo
      )
      const previousShifts = shifts.filter(s =>
        new Date(s.created_at) >= sixtyDaysAgo &&
        new Date(s.created_at) < thirtyDaysAgo
      )

      const recentEarnings = recentShifts.reduce((sum, s) => sum + (s.shift?.price || 0), 0)
      const previousEarnings = previousShifts.reduce((sum, s) => sum + (s.shift?.price || 0), 0)

      const growthPercentage = previousEarnings > 0
        ? ((recentEarnings - previousEarnings) / previousEarnings) * 100
        : 0

      // Monthly earnings for last 6 months
      const monthlyEarnings: { [key: string]: number } = {}
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        monthlyEarnings[monthKey] = 0
      }

      shifts.forEach(s => {
        const shiftDate = new Date(s.shift?.date || s.created_at)
        const monthKey = `${monthNames[shiftDate.getMonth()]} ${shiftDate.getFullYear()}`
        if (monthlyEarnings.hasOwnProperty(monthKey)) {
          monthlyEarnings[monthKey] += s.shift?.price || 0
        }
      })

      const monthlyEarningsData = Object.entries(monthlyEarnings).map(([month, amount]) => ({
        month,
        amount
      }))

      // Category breakdown
      const categoryCount: { [key: string]: number } = {}
      shifts.forEach(s => {
        const category = s.shift?.category || 'Другое'
        categoryCount[category] = (categoryCount[category] || 0) + 1
      })

      const categoryBreakdown = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#ec4899'
      }))

      // Rating trend (last 10 ratings)
      const ratingTrendData = ratingsData
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(-10)
        .map(r => ({
          date: new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          rating: r.rating
        }))

      // Top clients (by number of shifts)
      const clientStats: { [key: string]: { name: string; shifts: number; earnings: number } } = {}

      shifts.forEach(s => {
        if (s.shift?.client) {
          const clientId = s.shift.client.id
          const clientName = s.shift.client.full_name

          if (!clientStats[clientId]) {
            clientStats[clientId] = { name: clientName, shifts: 0, earnings: 0 }
          }

          clientStats[clientId].shifts += 1
          clientStats[clientId].earnings += s.shift.price || 0
        }
      })

      const topClients = Object.values(clientStats)
        .sort((a, b) => b.shifts - a.shifts)
        .slice(0, 5)

      setStats({
        totalShifts,
        totalEarnings,
        avgRating,
        growthPercentage,
        monthlyEarnings: monthlyEarningsData,
        categoryBreakdown,
        ratingTrend: ratingTrendData,
        topClients
      })
    } catch (error: any) {
      console.error('[Stats] Load stats error:', error)
      toast.error(`Ошибка загрузки статистики: ${error.message || 'Неизвестная ошибка'}`)
      // Set empty stats on error
      setStats({
        totalShifts: 0,
        totalEarnings: 0,
        avgRating: 0,
        growthPercentage: 0,
        monthlyEarnings: [],
        categoryBreakdown: [],
        ratingTrend: [],
        topClients: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-400" size={48} />
      </div>
    )
  }

  if (!session || !stats) return null

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/worker/profile"
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Статистика</h1>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Calendar className="text-blue-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{stats.totalShifts}</div>
            <div className="text-sm text-gray-400">Завершено смен</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <DollarSign className="text-green-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">
              {stats.totalEarnings.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">Заработано</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Star className="text-yellow-400 fill-yellow-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-gray-400">Средний рейтинг</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <TrendingUp className={`mb-2 ${stats.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`} size={24} />
            <div className={`text-2xl font-bold ${stats.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Рост за месяц</div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6 mb-6">
          {stats.monthlyEarnings.length > 0 && (
            <EarningsChart data={stats.monthlyEarnings} />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {stats.categoryBreakdown.length > 0 && (
              <ShiftsBreakdown data={stats.categoryBreakdown} />
            )}

            {stats.ratingTrend.length > 0 && (
              <RatingTrend data={stats.ratingTrend} currentRating={stats.avgRating} />
            )}
          </div>
        </div>

        {/* Top clients */}
        {stats.topClients.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={24} className="text-orange-400" />
              Топ клиенты
            </h3>
            <div className="space-y-3">
              {stats.topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{client.name}</div>
                      <div className="text-sm text-gray-400">
                        {client.shifts} {client.shifts === 1 ? 'смена' : client.shifts < 5 ? 'смены' : 'смен'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">
                      {client.earnings.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.totalShifts === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Статистика пока недоступна
            </h3>
            <p className="text-gray-400 mb-6">
              Завершите первую смену, чтобы увидеть вашу статистику
            </p>
            <Link
              href="/worker/shifts"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Найти смены
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
