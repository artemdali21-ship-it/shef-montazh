'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AlertTriangle, Filter, Search, Loader2 } from 'lucide-react'
import DisputeCard from '@/components/disputes/DisputeCard'

interface Dispute {
  id: string
  shift_id: string | null
  created_by: string
  against_user: string
  reason: string
  description: string
  status: string
  admin_notes: string | null
  resolution: string | null
  created_at: string
  resolved_at: string | null
  shift?: {
    title: string
    date: string
  }
  creator?: {
    full_name: string
  }
  against?: {
    full_name: string
  }
}

export default function WorkerDisputesPage() {
  const supabase = createClient()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDisputes()
  }, [])

  useEffect(() => {
    filterDisputes()
  }, [disputes, statusFilter, searchQuery])

  const loadDisputes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          shift:shifts(title, date),
          creator:users!created_by(full_name),
          against:users!against_user(full_name)
        `)
        .or(`created_by.eq.${user.id},against_user.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDisputes(data || [])
    } catch (error) {
      console.error('Error loading disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDisputes = () => {
    let filtered = disputes

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.description.toLowerCase().includes(query) ||
        d.shift?.title.toLowerCase().includes(query) ||
        d.creator?.full_name.toLowerCase().includes(query) ||
        d.against?.full_name.toLowerCase().includes(query)
      )
    }

    setFilteredDisputes(filtered)
  }

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    in_review: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Споры и жалобы</h1>
            <p className="text-gray-400">Всего споров: {stats.total}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Фильтры</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">Все статусы</option>
              <option value="open">Открыто</option>
              <option value="in_review">На рассмотрении</option>
              <option value="resolved">Решено</option>
              <option value="rejected">Отклонено</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        {filteredDisputes.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {disputes.length === 0 ? 'Нет споров' : 'Ничего не найдено'}
            </h3>
            <p className="text-gray-400">
              {disputes.length === 0
                ? 'У вас нет активных или завершённых споров'
                : 'Попробуйте изменить фильтры'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute as any}
                currentUserId={currentUserId || ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
