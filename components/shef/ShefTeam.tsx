'use client'

import { useState } from 'react'

interface ShefTeamProps {
  team: any[]
  shefId: string
}

export default function ShefTeam({ team = [], shefId }: ShefTeamProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeam = team.filter(member =>
    member.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск по имени..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
      />

      {/* Список команды */}
      {filteredTeam.length === 0 ? (
        <div className="p-8 text-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <p className="text-gray-400">
            {team.length === 0 ? 'У вас пока нет людей в команде' : 'Нет результатов'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-lg">
                    {member.users?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{member.users?.full_name || 'Неизвестно'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {member.users?.worker_profiles?.verification_level > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                        ✓ Верифицирован
                      </span>
                    )}
                    {member.users?.worker_profiles?.endorsement_count > 0 && (
                      <span className="text-xs text-gray-400">
                        🌟 {member.users?.worker_profiles?.endorsement_count} рек.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
