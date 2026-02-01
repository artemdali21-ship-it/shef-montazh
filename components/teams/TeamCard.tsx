'use client'

import Link from 'next/link'
import { Users, Calendar, Star, ChevronRight } from 'lucide-react'

interface TeamMember {
  worker: {
    id: string
    full_name: string
    avatar_url: string | null
    rating?: number
  }
}

interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
  team_members: TeamMember[]
}

interface Props {
  team: Team
}

export default function TeamCard({ team }: Props) {
  const memberCount = team.team_members?.length || 0
  const avgRating = memberCount > 0
    ? team.team_members.reduce((sum, m) => sum + (m.worker.rating || 0), 0) / memberCount
    : 0

  return (
    <Link href={`/shef/teams/${team.id}`}>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
            {team.description && (
              <p className="text-gray-400 text-sm line-clamp-2">{team.description}</p>
            )}
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-orange-400 transition" size={24} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-300">
            <Users size={18} className="text-orange-400" />
            <span className="text-sm">
              {memberCount} {memberCount === 1 ? 'участник' : memberCount < 5 ? 'участника' : 'участников'}
            </span>
          </div>

          {avgRating > 0 && (
            <div className="flex items-center gap-2 text-gray-300">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm">{avgRating.toFixed(1)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={18} />
            <span className="text-sm">
              {new Date(team.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Member avatars preview */}
        {memberCount > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {team.team_members.slice(0, 4).map((member) => (
                <div
                  key={member.worker.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-[#2A2A2A]"
                >
                  {member.worker.full_name[0]}
                </div>
              ))}
              {memberCount > 4 && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border-2 border-[#2A2A2A]">
                  +{memberCount - 4}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400 ml-2">
              {team.team_members.slice(0, 2).map(m => m.worker.full_name.split(' ')[0]).join(', ')}
              {memberCount > 2 && ` и ещё ${memberCount - 2}`}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
