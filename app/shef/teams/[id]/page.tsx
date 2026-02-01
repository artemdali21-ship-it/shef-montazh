'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Star, Trash2, Calendar, Loader2, Edit, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import AddMemberModal from '@/components/teams/AddMemberModal'

interface TeamMember {
  id: string
  worker_id: string
  added_at: string
  worker: {
    id: string
    full_name: string
    avatar_url: string | null
    phone?: string
    worker_profiles?: {
      rating?: number
      categories?: string[]
    }[]
  }
}

interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
  shef_id: string
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  useEffect(() => {
    loadTeam()
  }, [teamId])

  const loadTeam = async () => {
    setLoading(true)

    try {
      // Load team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError

      setTeam(teamData)

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          worker:users (
            id,
            full_name,
            avatar_url,
            phone,
            worker_profiles (
              rating,
              categories
            )
          )
        `)
        .eq('team_id', teamId)
        .order('added_at', { ascending: false })

      if (membersError) throw membersError

      setMembers(membersData || [])
    } catch (error: any) {
      console.error('Load team error:', error)
      toast.error('Ошибка загрузки бригады')
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Удалить участника из бригады?')) return

    setRemovingMember(memberId)

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast.success('Участник удалён из бригады')
      loadTeam()
    } catch (error: any) {
      console.error('Remove member error:', error)
      toast.error('Ошибка при удалении участника')
    } finally {
      setRemovingMember(null)
    }
  }

  const avgRating = members.length > 0
    ? members.reduce((sum, m) => sum + (m.worker.worker_profiles?.[0]?.rating || 0), 0) / members.length
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-400" size={48} />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Бригада не найдена</p>
          <Link
            href="/shef/teams"
            className="text-orange-400 hover:text-orange-500"
          >
            Вернуться к бригадам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/shef/teams"
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{team.name}</h1>
            {team.description && (
              <p className="text-gray-400">{team.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Users className="text-orange-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{members.length}</div>
            <div className="text-sm text-gray-400">Участников</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Star className="text-yellow-400 fill-yellow-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-gray-400">Средний рейтинг</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Calendar className="text-blue-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">
              {new Date(team.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-sm text-gray-400">Создана</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href={`/shef/teams/${teamId}/chat`}
            className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            <MessageCircle size={20} />
            Чат бригады
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            Добавить участника
          </button>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {members.length > 0 ? (
            members.map((member) => {
              const profile = member.worker.worker_profiles?.[0]
              return (
                <div
                  key={member.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.worker.avatar_url ? (
                      <img
                        src={member.worker.avatar_url}
                        alt={member.worker.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.worker.full_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {member.worker.full_name}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        {profile?.rating && (
                          <span>⭐ {profile.rating.toFixed(1)}</span>
                        )}
                        <span>
                          В бригаде с {new Date(member.added_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeMember(member.id)}
                    disabled={removingMember === member.id}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                  >
                    {removingMember === member.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              )
            })
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                В бригаде пока нет участников
              </h3>
              <p className="text-gray-400 mb-6">
                Добавьте исполнителей для работы в команде
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add member modal */}
      {showAddModal && (
        <AddMemberModal
          teamId={teamId}
          existingMembers={members.map(m => m.worker_id)}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadTeam()
          }}
        />
      )}
    </div>
  )
}
