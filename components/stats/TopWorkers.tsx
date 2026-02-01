'use client'

import { useEffect, useState } from 'react'
import { Star, Users as UsersIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface TopWorker {
  worker: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  count: number
  rating: number
}

export default function TopWorkers({ userId }: { userId: string }) {
  const supabase = createClient()
  const [workers, setWorkers] = useState<TopWorker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkers()
  }, [userId])

  const loadWorkers = async () => {
    try {
      // Get all shift workers for client's completed shifts
      const { data: shiftWorkers, error } = await supabase
        .from('shift_workers')
        .select(`
          worker_id,
          shift:shifts!inner (
            id,
            client_id
          ),
          worker:users (
            id,
            full_name,
            avatar_url,
            worker_profiles (
              rating
            )
          )
        `)
        .eq('shift.client_id', userId)
        .eq('status', 'completed')

      if (error) throw error

      if (!shiftWorkers || shiftWorkers.length === 0) {
        setWorkers([])
        return
      }

      // Count shifts per worker
      const workerCounts: { [key: string]: TopWorker } = {}

      shiftWorkers.forEach((sw: any) => {
        const workerId = sw.worker_id
        const worker = sw.worker

        if (!workerCounts[workerId]) {
          workerCounts[workerId] = {
            worker: {
              id: worker.id,
              full_name: worker.full_name,
              avatar_url: worker.avatar_url
            },
            count: 0,
            rating: worker.worker_profiles?.[0]?.rating || 0
          }
        }
        workerCounts[workerId].count++
      })

      // Sort by count and take top 5
      const sorted = Object.values(workerCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setWorkers(sorted)
    } catch (error) {
      console.error('Error loading top workers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">ТОП-5 исполнителей</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-gray-400">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <UsersIcon size={24} className="text-orange-400" />
        ТОП-5 исполнителей
      </h3>

      {workers.length > 0 ? (
        <div className="space-y-3">
          {workers.map((item, index) => (
            <div
              key={item.worker.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                {item.worker.avatar_url ? (
                  <img
                    src={item.worker.avatar_url}
                    alt={item.worker.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {item.worker.full_name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium text-white">{item.worker.full_name}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    {item.rating > 0 ? item.rating.toFixed(1) : '—'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  {item.count} {item.count === 1 ? 'смена' : item.count < 5 ? 'смены' : 'смен'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <UsersIcon size={48} className="text-gray-600 mb-3" />
          <p className="text-gray-400">Нет завершенных смен с исполнителями</p>
        </div>
      )}
    </div>
  )
}
