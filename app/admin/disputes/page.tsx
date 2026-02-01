import { createClient } from '@/lib/supabase-server'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import DisputeCard from '@/components/disputes/DisputeCard'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
}

async function getDisputes(searchParams: SearchParams) {
  const supabase = createClient()

  let query = supabase
    .from('disputes')
    .select(`
      *,
      shift:shifts(title, date),
      creator:users!disputes_created_by_fkey(full_name, email, avatar_url),
      against:users!disputes_against_user_fkey(full_name, email, avatar_url)
    `)

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching disputes:', error)
    return []
  }

  return data || []
}

async function getStats() {
  const supabase = createClient()

  const { data } = await supabase
    .from('disputes')
    .select('status')

  const stats = {
    total: data?.length || 0,
    open: data?.filter(d => d.status === 'open').length || 0,
    in_review: data?.filter(d => d.status === 'in_review').length || 0,
    resolved: data?.filter(d => d.status === 'resolved').length || 0,
    rejected: data?.filter(d => d.status === 'rejected').length || 0
  }

  return stats
}

export default async function AdminDisputesPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const disputes = await getDisputes(searchParams)
  const stats = await getStats()
  const currentStatus = searchParams.status || 'all'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Споры и жалобы</h1>
          <p className="text-gray-400">Управление конфликтами между пользователями</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-xs text-gray-400 mb-1">Всего</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-xs text-orange-400 mb-1">Открыто</p>
          <p className="text-2xl font-bold text-orange-400">{stats.open}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-400 mb-1">На рассмотрении</p>
          <p className="text-2xl font-bold text-blue-400">{stats.in_review}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-green-400 mb-1">Решено</p>
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-red-400 mb-1">Отклонено</p>
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/disputes"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentStatus === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Все ({stats.total})
          </Link>
          <Link
            href="/admin/disputes?status=open"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentStatus === 'open'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Открыты ({stats.open})
          </Link>
          <Link
            href="/admin/disputes?status=in_review"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentStatus === 'in_review'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            На рассмотрении ({stats.in_review})
          </Link>
          <Link
            href="/admin/disputes?status=resolved"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentStatus === 'resolved'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Решены ({stats.resolved})
          </Link>
          <Link
            href="/admin/disputes?status=rejected"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentStatus === 'rejected'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Отклонены ({stats.rejected})
          </Link>
        </div>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Споров не найдено</h3>
          <p className="text-gray-400">
            {currentStatus === 'all'
              ? 'В системе нет споров'
              : 'Нет споров с выбранным статусом'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Link
              key={dispute.id}
              href={`/admin/disputes/${dispute.id}`}
              className="block"
            >
              <DisputeCard
                dispute={dispute as any}
                currentUserId="admin"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
