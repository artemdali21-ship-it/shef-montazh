'use client'

import { useState, useEffect } from 'react'
import { Users, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'

interface Team {
  id: string
  name: string
  description: string | null
  team_members: {
    worker_id: string
    worker: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }[]
}

interface Props {
  shiftId: string
  clientId: string
  onSuccess: () => void
}

export default function AssignTeamButton({ shiftId, clientId, onSuccess }: Props) {
  const supabase = createClient()
  const toast = useToast()

  const [teams, setTeams] = useState<Team[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    if (showModal) {
      loadTeams()
    }
  }, [showModal])

  const loadTeams = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            worker_id,
            worker:users (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('shef_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTeams(data || [])
    } catch (error: any) {
      console.error('Load teams error:', error)
      toast.error('Ошибка загрузки бригад')
    } finally {
      setLoading(false)
    }
  }

  const assignTeam = async (team: Team) => {
    if (team.team_members.length === 0) {
      toast.error('В бригаде нет участников')
      return
    }

    const memberCount = team.team_members.length
    if (!confirm(`Назначить ${memberCount} ${memberCount === 1 ? 'участника' : memberCount < 5 ? 'участников' : 'участников'} на смену?`)) {
      return
    }

    setAssigning(team.id)

    try {
      // Get existing assignments to avoid duplicates
      const { data: existingAssignments } = await supabase
        .from('shift_workers')
        .select('worker_id')
        .eq('shift_id', shiftId)

      const existingWorkerIds = new Set(existingAssignments?.map(a => a.worker_id) || [])

      // Filter out workers already assigned
      const workersToAssign = team.team_members.filter(
        m => !existingWorkerIds.has(m.worker_id)
      )

      if (workersToAssign.length === 0) {
        toast.error('Все участники бригады уже назначены на эту смену')
        setAssigning(null)
        return
      }

      // Create shift_workers for each member
      const shiftWorkers = workersToAssign.map(m => ({
        shift_id: shiftId,
        worker_id: m.worker_id,
        status: 'assigned'
      }))

      const { error: assignError } = await supabase
        .from('shift_workers')
        .insert(shiftWorkers)

      if (assignError) throw assignError

      // Create notifications for all assigned workers
      const notifications = workersToAssign.map(m => ({
        user_id: m.worker_id,
        type: 'shift_assigned',
        title: 'Назначение на смену',
        message: `Вы назначены на смену в составе бригады "${team.name}"`,
        data: { shift_id: shiftId, team_id: team.id }
      }))

      await supabase.from('notifications').insert(notifications)

      const skippedCount = team.team_members.length - workersToAssign.length

      if (skippedCount > 0) {
        toast.success(
          `Назначено ${workersToAssign.length} из ${team.team_members.length} участников. ${skippedCount} уже были назначены.`
        )
      } else {
        toast.success(`Бригада "${team.name}" назначена! (${workersToAssign.length} чел.)`)
      }

      setShowModal(false)
      onSuccess()
    } catch (error: any) {
      console.error('Team assignment error:', error)
      toast.error(error.message || 'Ошибка при назначении бригады')
    } finally {
      setAssigning(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
      >
        <Users size={20} />
        Назначить бригаду
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dashboard border border-white/10 rounded-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Выберите бригаду</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
              ) : teams.length > 0 ? (
                teams.map((team) => {
                  const memberCount = team.team_members.length
                  const isAssigning = assigning === team.id

                  return (
                    <button
                      key={team.id}
                      onClick={() => assignTeam(team)}
                      disabled={isAssigning || memberCount === 0}
                      className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white mb-1">{team.name}</div>
                          {team.description && (
                            <div className="text-sm text-gray-400 mb-2 line-clamp-1">
                              {team.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-blue-400" />
                            <span className="text-sm text-gray-300">
                              {memberCount} {memberCount === 1 ? 'участник' : memberCount < 5 ? 'участника' : 'участников'}
                            </span>
                          </div>
                          {memberCount > 0 && (
                            <div className="flex -space-x-2 mt-2">
                              {team.team_members.slice(0, 5).map((member) => (
                                <div
                                  key={member.worker_id}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-[#2A2A2A]"
                                  title={member.worker.full_name}
                                >
                                  {member.worker.full_name[0]}
                                </div>
                              ))}
                              {memberCount > 5 && (
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border-2 border-[#2A2A2A]">
                                  +{memberCount - 5}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {isAssigning ? (
                          <Loader2 className="animate-spin text-blue-400 flex-shrink-0" size={24} />
                        ) : memberCount === 0 ? (
                          <AlertCircle className="text-gray-600 flex-shrink-0" size={24} />
                        ) : (
                          <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                        )}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">У вас пока нет бригад</p>
                  <a
                    href="/shef/teams/create"
                    className="text-blue-400 hover:text-blue-500 text-sm"
                  >
                    Создать бригаду
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-3 border border-white/10 rounded-xl font-medium text-white hover:bg-white/5 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  )
}
