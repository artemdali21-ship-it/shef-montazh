import { createClient } from '@/lib/supabase-server'
import { ArrowLeft, User, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import UserTimeline from '@/components/admin/UserTimeline'

async function getUserHistory(userId: string) {
  const supabase = createClient()

  try {
    // Get all user data in parallel
    const [
      userResult,
      shiftsResult,
      ratingsReceivedResult,
      ratingsGivenResult,
      paymentsResult,
      disputesResult,
      logsResult
    ] = await Promise.all([
      // User profile
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),

      // Shifts as worker
      supabase
        .from('shift_workers')
        .select(`
          *,
          shift:shifts (
            id,
            title,
            category,
            price,
            date,
            status
          )
        `)
        .eq('worker_id', userId)
        .order('created_at', { ascending: false }),

      // Ratings received
      supabase
        .from('worker_ratings')
        .select(`
          *,
          from_user:client_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('worker_id', userId)
        .order('created_at', { ascending: false }),

      // Ratings given (if client)
      supabase
        .from('worker_ratings')
        .select(`
          *,
          to_user:worker_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false }),

      // Payments
      supabase
        .from('payments')
        .select('*')
        .eq('worker_id', userId)
        .order('created_at', { ascending: false }),

      // Disputes (created by or against)
      supabase
        .from('disputes')
        .select('*')
        .or(`created_by.eq.${userId},against_user.eq.${userId}`)
        .order('created_at', { ascending: false }),

      // Audit logs
      supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    // Calculate stats
    const totalShifts = shiftsResult.data?.length || 0
    const completedShifts = shiftsResult.data?.filter(s => s.status === 'completed').length || 0
    const totalRatings = ratingsReceivedResult.data?.length || 0
    const avgRating = totalRatings > 0
      ? ratingsReceivedResult.data!.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0

    return {
      user: userResult.data,
      shifts: shiftsResult.data || [],
      ratingsReceived: ratingsReceivedResult.data || [],
      ratingsGiven: ratingsGivenResult.data || [],
      payments: paymentsResult.data || [],
      disputes: disputesResult.data || [],
      logs: logsResult.data || [],
      stats: {
        totalShifts,
        completedShifts,
        avgRating,
        totalRatings
      }
    }
  } catch (error) {
    console.error('Error fetching user history:', error)
    return {
      user: null,
      shifts: [],
      ratingsReceived: [],
      ratingsGiven: [],
      payments: [],
      disputes: [],
      logs: [],
      stats: {
        totalShifts: 0,
        completedShifts: 0,
        avgRating: 0,
        totalRatings: 0
      }
    }
  }
}

export default async function UserHistoryPage({
  params
}: {
  params: { id: string }
}) {
  const history = await getUserHistory(params.id)

  if (!history.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Пользователь не найден
          </h3>
          <Link
            href="/admin/users"
            className="text-orange-400 hover:text-orange-500"
          >
            Вернуться к списку
          </Link>
        </div>
      </div>
    )
  }

  const totalEvents =
    1 + // registration
    history.shifts.length +
    history.ratingsReceived.length +
    history.ratingsGiven.length +
    history.payments.length +
    history.disputes.length +
    history.logs.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/users/${params.id}`}
          className="p-2 hover:bg-white/10 rounded-xl transition"
        >
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">
            История: {history.user.full_name}
          </h1>
          <p className="text-gray-400">{history.user.email}</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-6">
          {history.user.avatar_url ? (
            <img
              src={history.user.avatar_url}
              alt={history.user.full_name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {history.user.full_name[0]}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {history.user.full_name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="capitalize">{history.user.role || 'worker'}</span>
              <span>•</span>
              <span>
                Зарегистрирован {new Date(history.user.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <div className="text-sm text-gray-400">Всего событий</div>
          </div>
          <div className="text-2xl font-bold text-white">{totalEvents}</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-green-400" />
            </div>
            <div className="text-sm text-gray-400">Смены</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {history.stats.completedShifts}/{history.stats.totalShifts}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-yellow-400" />
            </div>
            <div className="text-sm text-gray-400">Средний рейтинг</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {history.stats.avgRating > 0 ? history.stats.avgRating.toFixed(1) : '—'}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <User size={20} className="text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">Оценок получено</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {history.stats.totalRatings}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <UserTimeline history={history} />
    </div>
  )
}
