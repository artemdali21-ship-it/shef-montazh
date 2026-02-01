import { createClient } from '@/lib/supabase-server'
import { ArrowLeft, Download, Send, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import ExportSegmentButton from '@/components/admin/ExportSegmentButton'
import SegmentUsersTable from '@/components/admin/SegmentUsersTable'

const SEGMENT_INFO: Record<string, { name: string; description: string }> = {
  'top-workers': {
    name: 'ТОП исполнители',
    description: 'Исполнители с рейтингом выше 4.8'
  },
  'problematic': {
    name: 'Проблемные пользователи',
    description: 'Пользователи с банами или спорами'
  },
  'inactive': {
    name: 'Неактивные пользователи',
    description: 'Не проявляли активность последние 30 дней'
  },
  'newbies': {
    name: 'Новички',
    description: 'Исполнители с менее чем 5 завершёнными сменами'
  },
  'vip-clients': {
    name: 'VIP клиенты',
    description: 'Клиенты, потратившие более 100,000 рублей'
  }
}

async function getSegmentUsers(segmentId: string) {
  const supabase = createClient()

  try {
    switch (segmentId) {
      case 'top-workers': {
        const { data } = await supabase
          .from('users')
          .select('*, worker_profiles(rating)')
          .eq('role', 'worker')
          .gte('rating', 4.8)
          .order('rating', { ascending: false })

        return data || []
      }

      case 'problematic': {
        // Get banned users
        const { data: bannedProfiles } = await supabase
          .from('worker_profiles')
          .select('user_id, users(*)')
          .eq('status', 'banned')

        // Get users with disputes
        const { data: disputes } = await supabase
          .from('disputes')
          .select('created_by, against_user')

        const userIds = new Set([
          ...(bannedProfiles?.map(p => p.user_id) || []),
          ...(disputes?.flatMap(d => [d.created_by, d.against_user]) || [])
        ])

        const { data: users } = await supabase
          .from('users')
          .select('*')
          .in('id', Array.from(userIds))

        return users || []
      }

      case 'inactive': {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: activeUserIds } = await supabase
          .from('audit_logs')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString())

        const activeIds = new Set(activeUserIds?.map(l => l.user_id).filter(Boolean))

        const { data: allUsers } = await supabase
          .from('users')
          .select('*')

        return allUsers?.filter(u => !activeIds.has(u.id)) || []
      }

      case 'newbies': {
        const { data: shiftWorkers } = await supabase
          .from('shift_workers')
          .select('worker_id, users(*)')
          .eq('status', 'completed')

        const workerShiftCounts: Record<string, { count: number; user: any }> = {}

        shiftWorkers?.forEach(sw => {
          if (!workerShiftCounts[sw.worker_id]) {
            workerShiftCounts[sw.worker_id] = { count: 0, user: sw.users }
          }
          workerShiftCounts[sw.worker_id].count++
        })

        return Object.values(workerShiftCounts)
          .filter(w => w.count < 5)
          .map(w => w.user)
          .filter(Boolean)
      }

      case 'vip-clients': {
        const { data: payments } = await supabase
          .from('payments')
          .select('client_id, amount, users(*)')
          .eq('status', 'paid')

        const clientSpending: Record<string, { total: number; user: any }> = {}

        payments?.forEach(p => {
          if (p.client_id) {
            if (!clientSpending[p.client_id]) {
              clientSpending[p.client_id] = { total: 0, user: p.users }
            }
            clientSpending[p.client_id].total += p.amount || 0
          }
        })

        return Object.entries(clientSpending)
          .filter(([_, data]) => data.total > 100000)
          .map(([_, data]) => ({
            ...data.user,
            total_spent: data.total
          }))
      }

      default:
        return []
    }
  } catch (error) {
    console.error(`Error fetching segment ${segmentId}:`, error)
    return []
  }
}

export default async function SegmentDetailPage({
  params
}: {
  params: { id: string }
}) {
  const segmentInfo = SEGMENT_INFO[params.id]

  if (!segmentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UsersIcon size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Сегмент не найден
          </h3>
          <Link
            href="/admin/segments"
            className="text-orange-400 hover:text-orange-500"
          >
            Вернуться к сегментам
          </Link>
        </div>
      </div>
    )
  }

  const users = await getSegmentUsers(params.id)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/segments"
          className="p-2 hover:bg-white/10 rounded-xl transition"
        >
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">
            {segmentInfo.name}
          </h1>
          <p className="text-gray-400">{segmentInfo.description}</p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Пользователей в сегменте</div>
            <div className="text-3xl font-bold text-white">
              {users.length.toLocaleString('ru-RU')}
            </div>
          </div>

          <div className="flex gap-3">
            <ExportSegmentButton users={users} segmentName={segmentInfo.name} />

            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              disabled={users.length === 0}
              title="Массовая рассылка (в разработке)"
            >
              <Send size={20} />
              Рассылка
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <SegmentUsersTable users={users} segmentId={params.id} />
    </div>
  )
}
