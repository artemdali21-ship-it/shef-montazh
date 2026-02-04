'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, ArrowLeft } from 'lucide-react'
import TeamCard from '@/components/teams/TeamCard'
import { createClient } from '@/lib/supabase-client'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function TeamsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadTeams()
    } else if (!sessionLoading && !session) {
      router.push('/')
    }
  }, [sessionLoading, session])

  const loadTeams = async () => {
    if (!session) return

    try {
      setLoading(true)

      const { data: teamsData } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            worker:users (
              id,
              full_name,
              avatar_url,
              worker_profiles (
                rating
              )
            )
          )
        `)
        .eq('shef_id', session.userId)
        .order('created_at', { ascending: false })

      // Transform data to match TeamCard interface
      const transformedTeams = teamsData?.map(team => ({
        ...team,
        team_members: team.team_members.map((tm: any) => ({
          worker: {
            ...tm.worker,
            rating: tm.worker.worker_profiles?.[0]?.rating
          }
        }))
      }))

      setTeams(transformedTeams || [])
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Загрузка бригад..." />
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/shef/dashboard')}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Мои бригады</h1>
            <p className="text-gray-400">Управление командами исполнителей</p>
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={() => router.push('/shef/teams/create')}
          className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition mb-6"
        >
          <Plus size={20} />
          Создать бригаду
        </button>

        {/* Teams list */}
        {teams && teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              У вас пока нет бригад
            </h3>
            <p className="text-gray-400 mb-6">
              Создайте бригаду для группового найма на смены
            </p>
            <button
              onClick={() => router.push('/shef/teams/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              <Plus size={20} />
              Создать первую бригаду
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
