'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Calendar, CheckCircle, Star, Plus, Briefcase } from 'lucide-react'
import { getShefTeams, getTeamStats } from '@/lib/api/teams'
import { getShefActiveShifts, getShiftWithWorkers, completeShift } from '@/lib/api/shifts'
import TeamCard from '@/components/shef/TeamCard'
import ShiftMonitoring from '@/components/shef/ShiftMonitoring'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import toast from 'react-hot-toast'
import type { TeamWithWorkers } from '@/lib/api/teams'

interface ShiftWithWorkers {
  id: string
  title: string
  category: string
  location_address: string
  date: string
  start_time: string
  end_time: string
  status: string
  workers: any[]
}

interface TeamStats {
  totalShifts: number
  completedShifts: number
  averageRating: number
}

type TabType = 'shifts' | 'teams'

export default function ShefDashboard() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [activeTab, setActiveTab] = useState<TabType>('shifts')
  const [teams, setTeams] = useState<TeamWithWorkers[]>([])
  const [shifts, setShifts] = useState<ShiftWithWorkers[]>([])
  const [teamStats, setTeamStats] = useState<Record<string, TeamStats>>({})
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeShifts: 0,
    totalShifts: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionLoading && session) {
      console.log('[ShefDashboard] Loading data for user:', session.userId)
      loadData(session.userId)
    } else if (!sessionLoading && !session) {
      console.log('[ShefDashboard] No session, redirecting to home')
      router.push('/')
    }
  }, [sessionLoading, session])

  const loadData = async (shefId: string) => {
    try {
      setLoading(true)

      // Initialize statsMap
      let statsMap: Record<string, TeamStats> = {}

      // Load teams
      const { data: teamsData, error: teamsError } = await getShefTeams(shefId)
      if (!teamsError && teamsData) {
        setTeams(teamsData)

        // Load stats for each team
        const statsPromises = teamsData.map(async (team) => {
          const { data: stats } = await getTeamStats(team.id)
          return { teamId: team.id, stats }
        })

        const statsResults = await Promise.all(statsPromises)
        statsResults.forEach(({ teamId, stats }) => {
          if (stats) {
            statsMap[teamId] = stats
          }
        })
        setTeamStats(statsMap)
      }

      // Load active shifts
      const { data: shiftsData, error: shiftsError } = await getShefActiveShifts(shefId)
      if (!shiftsError && shiftsData) {
        // Get workers for each shift
        const shiftsWithWorkers = await Promise.all(
          shiftsData.map(async (shift) => {
            const { data: shiftWithWorkers } = await getShiftWithWorkers(shift.id)
            return shiftWithWorkers || shift
          })
        )
        setShifts(shiftsWithWorkers)
      }

      // Calculate overall stats
      const totalTeams = teamsData?.length || 0
      const activeShifts = shiftsData?.filter((s) => s.status === 'in_progress').length || 0
      const totalShifts = shiftsData?.length || 0

      // Calculate average rating from all teams
      let totalRating = 0
      let ratingCount = 0
      Object.values(statsMap).forEach((stat) => {
        if (stat.averageRating > 0) {
          totalRating += stat.averageRating
          ratingCount++
        }
      })
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

      setStats({
        totalTeams,
        activeShifts,
        totalShifts,
        averageRating: parseFloat(averageRating.toFixed(1)),
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteShift = async (shiftId: string) => {
    if (!session) return

    try {
      toast.loading('Завершение смены...')
      const { error } = await completeShift(shiftId)
      toast.dismiss()

      if (!error) {
        toast.success('Смена успешно завершена!')
        // Reload data
        loadData(session.userId)
      } else {
        toast.error('Ошибка при завершении смены')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Ошибка при завершении смены')
      console.error('Error completing shift:', error)
    }
  }

  const handleInviteTeam = (teamId: string) => {
    // TODO: Implement invite to shift modal
    console.log('Invite team:', teamId)
  }

  const handleEditTeam = (teamId: string) => {
    // TODO: Implement edit team modal
    console.log('Edit team:', teamId)
  }

  const handleCreateTeam = () => {
    // TODO: Implement create team modal
    console.log('Create team')
  }

  // Show loading while session is loading OR data is loading
  if (sessionLoading || loading) {
    return <LoadingScreen message="Загрузка панели управления..." />
  }

  // If no session after loading - don't render (will redirect in useEffect)
  if (!session) {
    return <LoadingScreen message="Проверка авторизации..." />
  }

  return (
    <motion.div
      className="py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Панель Шефа</h1>
          <p className="text-gray-400">Управляйте бригадами и мониторьте смены</p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
                <p className="text-sm text-gray-400">Моих бригад</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.activeShifts}</p>
                <p className="text-sm text-gray-400">Активных смен</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalShifts}</p>
                <p className="text-sm text-gray-400">Всего смен</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {stats.averageRating > 0 ? stats.averageRating : '—'}
                </p>
                <p className="text-sm text-gray-400">Средний рейтинг</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-6 py-2.5 rounded-xl font-medium transition ${
              activeTab === 'shifts'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Текущие смены
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-2.5 rounded-xl font-medium transition ${
              activeTab === 'teams'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Мои бригады
          </button>
        </div>

        {/* Content */}
        {activeTab === 'shifts' ? (
          <div className="space-y-6">
            {shifts.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">Нет активных смен</h3>
                <p className="text-gray-400">Активные смены появятся здесь</p>
              </div>
            ) : (
              shifts.map((shift) => (
                <ShiftMonitoring
                  key={shift.id}
                  shift={shift}
                  onComplete={handleCompleteShift}
                />
              ))
            )}
          </div>
        ) : (
          <div>
            {/* Create Team Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateTeam}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Создать бригаду
              </button>
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">Нет бригад</h3>
                <p className="text-gray-400 mb-6">Создайте первую бригаду для управления командой</p>
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Создать бригаду
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    stats={
                      teamStats[team.id] || {
                        totalShifts: 0,
                        completedShifts: 0,
                        averageRating: 0,
                      }
                    }
                    onInvite={handleInviteTeam}
                    onEdit={handleEditTeam}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
