'use client'

import { Users, Star, Edit, Send } from 'lucide-react'
import type { TeamWithWorkers } from '@/lib/api/teams'

interface TeamCardProps {
  team: TeamWithWorkers
  stats: {
    totalShifts: number
    completedShifts: number
    averageRating: number
  }
  onInvite: (teamId: string) => void
  onEdit: (teamId: string) => void
}

export default function TeamCard({ team, stats, onInvite, onEdit }: TeamCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{team.workers.length} человек</span>
          </div>
        </div>
      </div>

      {/* Workers */}
      <div className="mb-4">
        {team.workers.length > 0 ? (
          <div className="space-y-2">
            {team.workers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {worker.avatar_url ? (
                    <img
                      src={worker.avatar_url}
                      alt={worker.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    worker.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{worker.full_name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{(worker.rating || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span>{worker.total_shifts || 0} смен</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Нет участников</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/5 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.totalShifts}</p>
          <p className="text-xs text-gray-400">Смен вместе</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <p className="text-2xl font-bold text-white">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
            </p>
          </div>
          <p className="text-xs text-gray-400">Средний рейтинг</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onInvite(team.id)}
          className="flex-1 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 font-medium transition text-sm flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Пригласить
        </button>
        <button
          onClick={() => onEdit(team.id)}
          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Править
        </button>
      </div>
    </div>
  )
}
