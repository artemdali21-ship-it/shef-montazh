import { createClient } from '@/lib/supabase-server'
import { ArrowLeft, User, Mail, Calendar, Shield, Ban, CheckCircle, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import AdminNotes from '@/components/admin/AdminNotes'

export const dynamic = 'force-dynamic'

async function getUserDetails(userId: string) {
  const supabase = createClient()

  try {
    // Get user with profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        worker_profiles (
          status,
          ban_reason,
          ban_until,
          verification_status,
          rating,
          categories
        )
      `)
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get shift statistics
    const { count: totalShifts } = await supabase
      .from('shift_workers')
      .select('*', { count: 'exact', head: true })
      .eq('worker_id', userId)

    const { count: completedShifts } = await supabase
      .from('shift_workers')
      .select('*', { count: 'exact', head: true })
      .eq('worker_id', userId)
      .eq('status', 'completed')

    // Get ratings count
    const { count: ratingsCount } = await supabase
      .from('worker_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('worker_id', userId)

    // Get payment statistics
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('worker_id', userId)

    const totalEarnings = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const paidPayments = payments?.filter(p => p.status === 'paid' || p.status === 'succeeded').length || 0

    // Get disputes
    const { count: disputesCount } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .or(`created_by.eq.${userId},against_user.eq.${userId}`)

    // Get admin notes count
    const { count: notesCount } = await supabase
      .from('admin_notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      user,
      stats: {
        totalShifts: totalShifts || 0,
        completedShifts: completedShifts || 0,
        ratingsCount: ratingsCount || 0,
        totalEarnings,
        paidPayments: paidPayments || 0,
        disputesCount: disputesCount || 0,
        notesCount: notesCount || 0
      }
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    return {
      user: null,
      stats: {
        totalShifts: 0,
        completedShifts: 0,
        ratingsCount: 0,
        totalEarnings: 0,
        paidPayments: 0,
        disputesCount: 0,
        notesCount: 0
      }
    }
  }
}

export default async function UserDetailPage({
  params
}: {
  params: { id: string }
}) {
  const { user, stats } = await getUserDetails(params.id)

  if (!user) {
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

  const profile = user.worker_profiles?.[0]
  const isBanned = profile?.status === 'banned'
  const banUntil = profile?.ban_until ? new Date(profile.ban_until) : null
  const isPermanentBan = isBanned && !banUntil
  const isBanExpired = banUntil && banUntil < new Date()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'shef':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'worker':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'client':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'shef':
        return 'Шеф'
      case 'worker':
        return 'Исполнитель'
      case 'client':
        return 'Заказчик'
      default:
        return role
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-white/10 rounded-xl transition"
        >
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">
            Профиль пользователя
          </h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <Link
          href={`/admin/users/${params.id}/history`}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition"
        >
          <Clock size={20} />
          История
        </Link>
      </div>

      {/* User Info Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.full_name[0]}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold text-white">
                {user.full_name}
              </h2>
              {(user.role === 'admin' || user.role === 'shef') && (
                <Shield className="text-orange-400" size={24} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} className="text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-300">
                  <span>📱 {user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            {/* Ban Status */}
            {isBanned && !isBanExpired && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="text-red-400" size={20} />
                  <span className="font-semibold text-red-400">
                    Пользователь заблокирован
                  </span>
                </div>
                {profile.ban_reason && (
                  <p className="text-sm text-gray-300 mb-2">
                    Причина: {profile.ban_reason}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {isPermanentBan ? 'Навсегда' : `До ${banUntil?.toLocaleDateString('ru-RU')}`}
                </p>
              </div>
            )}

            {/* Active Status */}
            {!isBanned && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="text-green-400" size={20} />
                <span className="font-semibold text-green-400">Активен</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-400" />
            </div>
            <div className="text-sm text-gray-400">Смены</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.completedShifts}/{stats.totalShifts}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-yellow-400" />
            </div>
            <div className="text-sm text-gray-400">Рейтинг</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {profile?.rating ? profile.rating.toFixed(1) : '—'}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-lg">₽</span>
            </div>
            <div className="text-sm text-gray-400">Заработано</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalEarnings.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Ban size={20} className="text-red-400" />
            </div>
            <div className="text-sm text-gray-400">Споры</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.disputesCount}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <AdminNotes userId={params.id} />
    </div>
  )
}
