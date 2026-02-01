import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Users, TrendingUp, AlertTriangle, Clock, Sparkles, Crown } from 'lucide-react'

interface Segment {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
}

const SEGMENTS: Segment[] = [
  {
    id: 'top-workers',
    name: 'ТОП исполнители',
    description: 'Рейтинг > 4.8',
    icon: TrendingUp,
    color: 'green-400',
    bgColor: 'green-500/20'
  },
  {
    id: 'problematic',
    name: 'Проблемные',
    description: 'С банами или спорами',
    icon: AlertTriangle,
    color: 'red-400',
    bgColor: 'red-500/20'
  },
  {
    id: 'inactive',
    name: 'Неактивные 30 дней',
    description: 'Нет активности месяц',
    icon: Clock,
    color: 'gray-400',
    bgColor: 'gray-500/20'
  },
  {
    id: 'newbies',
    name: 'Новички',
    description: '< 5 завершённых смен',
    icon: Sparkles,
    color: 'blue-400',
    bgColor: 'blue-500/20'
  },
  {
    id: 'vip-clients',
    name: 'VIP клиенты',
    description: '> 100k потрачено',
    icon: Crown,
    color: 'purple-400',
    bgColor: 'purple-500/20'
  }
]

async function getSegmentCount(segmentId: string): Promise<number> {
  const supabase = createClient()

  try {
    switch (segmentId) {
      case 'top-workers': {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'worker')
          .gte('rating', 4.8)
        return count || 0
      }

      case 'problematic': {
        // Users with bans or disputes
        const { data: bannedUsers } = await supabase
          .from('worker_profiles')
          .select('user_id')
          .eq('status', 'banned')

        const { data: disputeUsers } = await supabase
          .from('disputes')
          .select('created_by, against_user')

        const uniqueUsers = new Set([
          ...(bannedUsers?.map(u => u.user_id) || []),
          ...(disputeUsers?.map(d => d.created_by) || []),
          ...(disputeUsers?.map(d => d.against_user) || [])
        ])

        return uniqueUsers.size
      }

      case 'inactive': {
        // Users with no activity in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: activeUsers } = await supabase
          .from('audit_logs')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString())

        const activeUserIds = new Set(activeUsers?.map(l => l.user_id).filter(Boolean))

        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        return (totalUsers || 0) - activeUserIds.size
      }

      case 'newbies': {
        // Workers with < 5 completed shifts
        const { data: shiftCounts } = await supabase
          .from('shift_workers')
          .select('worker_id')
          .eq('status', 'completed')

        const workerShiftCounts: Record<string, number> = {}
        shiftCounts?.forEach(s => {
          workerShiftCounts[s.worker_id] = (workerShiftCounts[s.worker_id] || 0) + 1
        })

        return Object.values(workerShiftCounts).filter(count => count < 5).length
      }

      case 'vip-clients': {
        // Clients with > 100k spent
        const { data: payments } = await supabase
          .from('payments')
          .select('client_id, amount')
          .eq('status', 'paid')

        const clientSpending: Record<string, number> = {}
        payments?.forEach(p => {
          if (p.client_id) {
            clientSpending[p.client_id] = (clientSpending[p.client_id] || 0) + (p.amount || 0)
          }
        })

        return Object.values(clientSpending).filter(amount => amount > 100000).length
      }

      default:
        return 0
    }
  } catch (error) {
    console.error(`Error counting segment ${segmentId}:`, error)
    return 0
  }
}

export default async function SegmentsPage() {
  const segmentsWithCounts = await Promise.all(
    SEGMENTS.map(async (segment) => ({
      ...segment,
      count: await getSegmentCount(segment.id)
    }))
  )

  const totalUsers = segmentsWithCounts.reduce((sum, s) => sum + s.count, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Сегменты пользователей</h1>
        <p className="text-gray-400">Группировка пользователей для массовых действий</p>
      </div>

      {/* Total Stats */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Всего в сегментах</div>
            <div className="text-3xl font-bold text-white">{totalUsers.toLocaleString('ru-RU')}</div>
          </div>
          <Users size={48} className="text-orange-400" />
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentsWithCounts.map((segment) => {
          const Icon = segment.icon

          return (
            <Link
              key={segment.id}
              href={`/admin/segments/${segment.id}`}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition group"
            >
              <div className={`w-14 h-14 bg-${segment.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <Icon size={28} className={`text-${segment.color}`} />
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {segment.name}
                </h3>
                <p className="text-sm text-gray-400">{segment.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-white">
                  {segment.count.toLocaleString('ru-RU')}
                </div>
                <div className="text-sm text-gray-500">
                  пользователей
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
