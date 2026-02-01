'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, Star, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import SpendingChart from '@/components/stats/SpendingChart'
import TopWorkers from '@/components/stats/TopWorkers'

interface ClientStats {
  totalShifts: number
  totalSpending: number
  avgRating: number
  successRate: number
}

export default function ClientStatsPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const [stats, setStats] = useState<ClientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserId(user.id)

      // Total shifts
      const { count: totalShifts } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)

      // Total spending (from completed shifts)
      const { data: completedShifts } = await supabase
        .from('shifts')
        .select('price')
        .eq('client_id', user.id)
        .eq('status', 'completed')

      const totalSpending = completedShifts?.reduce((sum, s) => sum + (s.price || 0), 0) || 0

      // Average rating given to workers
      const { data: ratings } = await supabase
        .from('worker_ratings')
        .select('rating')
        .eq('client_id', user.id)

      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

      // Success rate (completed / total)
      const { count: completedCount } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'completed')

      const successRate = totalShifts && completedCount
        ? (completedCount / totalShifts) * 100
        : 0

      setStats({
        totalShifts: totalShifts || 0,
        totalSpending,
        avgRating,
        successRate
      })
    } catch (error: any) {
      console.error('Load stats error:', error)
      toast.error('Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-400" size={48} />
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      label: 'Опубликовано смен',
      value: stats.totalShifts,
      icon: Calendar,
      color: 'blue-400',
      bgColor: 'blue-500/10'
    },
    {
      label: 'Потрачено',
      value: `${(stats.totalSpending / 1000).toFixed(0)}k ₽`,
      icon: DollarSign,
      color: 'red-400',
      bgColor: 'red-500/10'
    },
    {
      label: 'Средняя оценка',
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—',
      icon: Star,
      color: 'yellow-400',
      bgColor: 'yellow-500/10'
    },
    {
      label: 'Успешных смен',
      value: `${stats.successRate.toFixed(0)}%`,
      icon: CheckCircle,
      color: 'green-400',
      bgColor: 'green-500/10'
    }
  ]

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/client/profile"
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Статистика</h1>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <div className={`w-12 h-12 bg-${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} className={`text-${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {card.value}
                </div>
                <div className="text-sm text-gray-400">{card.label}</div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart userId={userId} />
          <TopWorkers userId={userId} />
        </div>

        {/* Empty state */}
        {stats.totalShifts === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center mt-6">
            <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Статистика пока недоступна
            </h3>
            <p className="text-gray-400 mb-6">
              Создайте первую смену, чтобы увидеть вашу статистику
            </p>
            <Link
              href="/create-shift"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Создать смену
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
