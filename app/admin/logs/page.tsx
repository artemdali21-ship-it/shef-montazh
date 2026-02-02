import { createServerClient as createClient } from '@/lib/supabase-server'
import { Shield, Clock, Activity } from 'lucide-react'
import AuditLogTable from '@/components/admin/AuditLogTable'

export const dynamic = 'force-dynamic'

async function getLogsStats() {
  const supabase = createClient()

  try {
    // Total logs count
    const { count: totalLogs } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    // Recent logs (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentLogs } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo)

    // Unique users (last 24 hours)
    const { data: recentActivity } = await supabase
      .from('audit_logs')
      .select('user_id')
      .gte('created_at', twentyFourHoursAgo)

    const uniqueUsers = new Set(
      recentActivity?.map(log => log.user_id).filter(Boolean)
    ).size

    return {
      totalLogs: totalLogs || 0,
      recentLogs: recentLogs || 0,
      uniqueUsers
    }
  } catch (error) {
    console.error('Error fetching logs stats:', error)
    return {
      totalLogs: 0,
      recentLogs: 0,
      uniqueUsers: 0
    }
  }
}

async function getLogs({
  action,
  userId,
  limit = 100
}: {
  action?: string
  userId?: string
  limit?: number
} = {}) {
  const supabase = createClient()

  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (action) {
      query = query.eq('action', action)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching logs:', error)
    return []
  }
}

export default async function AdminLogsPage({
  searchParams
}: {
  searchParams: { action?: string; user_id?: string }
}) {
  const [stats, logs] = await Promise.all([
    getLogsStats(),
    getLogs({
      action: searchParams.action,
      userId: searchParams.user_id
    })
  ])

  const cards = [
    {
      label: 'Всего записей',
      value: stats.totalLogs.toLocaleString('ru-RU'),
      icon: Shield,
      color: 'blue',
      bgColor: 'blue-500/20'
    },
    {
      label: 'За последние 24 часа',
      value: stats.recentLogs.toLocaleString('ru-RU'),
      icon: Clock,
      color: 'green',
      bgColor: 'green-500/20'
    },
    {
      label: 'Активных пользователей',
      value: stats.uniqueUsers.toLocaleString('ru-RU'),
      icon: Activity,
      color: 'orange',
      bgColor: 'orange-500/20'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Логи действий</h1>
        <p className="text-gray-400">История всех действий на платформе</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className={`w-12 h-12 bg-${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} className={`text-${card.color}-400`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Audit Log Table */}
      <AuditLogTable logs={logs} />
    </div>
  )
}
