'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'

interface Worker {
  id: string
  full_name: string
  avatar_url: string | null
  phone?: string
  worker_profiles?: {
    rating?: number
    categories?: string[]
  }
}

interface Props {
  teamId: string
  existingMembers: string[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddMemberModal({
  teamId,
  existingMembers,
  onClose,
  onSuccess
}: Props) {
  const supabase = createClient()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    loadWorkers()
  }, [search])

  const loadWorkers = async () => {
    setLoading(true)

    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          full_name,
          avatar_url,
          phone,
          worker_profiles (
            rating,
            categories
          )
        `)
        .eq('role', 'worker')

      // Exclude existing members
      if (existingMembers.length > 0) {
        query = query.not('id', 'in', `(${existingMembers.join(',')})`)
      }

      // Search by name
      if (search.trim()) {
        query = query.ilike('full_name', `%${search.trim()}%`)
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      setWorkers(data || [])
    } catch (error: any) {
      console.error('Load workers error:', error)
      toast.error('Ошибка загрузки исполнителей')
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (workerId: string) => {
    setAdding(workerId)

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          worker_id: workerId
        })

      if (error) throw error

      toast.success('Участник добавлен в бригаду')
      onSuccess()
    } catch (error: any) {
      console.error('Add member error:', error)
      if (error.code === '23505') {
        toast.error('Участник уже в бригаде')
      } else {
        toast.error('Ошибка при добавлении участника')
      }
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dashboard border border-white/10 rounded-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Добавить участника</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-400" size={32} />
            </div>
          ) : workers.length > 0 ? (
            workers.map((worker) => {
              const profile = worker.worker_profiles?.[0]
              return (
                <div
                  key={worker.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt={worker.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {worker.full_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {worker.full_name}
                      </div>
                      {profile?.rating && (
                        <div className="text-sm text-gray-400">
                          ⭐ {profile.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addMember(worker.id)}
                    disabled={adding === worker.id}
                    className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 disabled:opacity-50 transition flex items-center justify-center"
                  >
                    {adding === worker.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </button>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">
                {search ? 'Исполнители не найдены' : 'Нет доступных исполнителей'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
