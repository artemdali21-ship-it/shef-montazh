'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import ShefToday from '@/components/shef/ShefToday'
import ShefTeam from '@/components/shef/ShefTeam'
import ShefRequestPersonnel from '@/components/shef/ShefRequestPersonnel'

export default function ShefDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'team' | 'request'>('today')
  const [shifts, setShifts] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData()
    } else if (!sessionLoading && !session) {
      router.push('/')
    }
  }, [sessionLoading, session])

  const loadData = async () => {
    if (!session) return

    setLoading(true)
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      setUser(userData)

      // Load today's shifts
      const today = new Date().toISOString().split('T')[0]
      const { data: shiftsData } = await supabase
        .from('shifts')
        .select('*, shift_assignments(worker_id, status, check_in_time, users(full_name))')
        .eq('shef_id', session.userId)
        .eq('date', today)

      if (shiftsData) setShifts(shiftsData)

      // Load team members
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*, users(id, full_name, avatar_url, worker_profiles(verification_level, endorsement_count))')
        .eq('team_id', session.userId)

      if (teamData) setTeam(teamData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-white">Панель шефа</h1>

      {/* Вкладки */}
      <div className="flex gap-2 mb-6 border-b border-white/20">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'today'
              ? 'border-b-2 border-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Сегодня ({shifts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'team'
              ? 'border-b-2 border-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Мои люди ({team?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'request'
              ? 'border-b-2 border-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Запросить персонал
        </button>
      </div>

      {/* Контент */}
      {activeTab === 'today' && <ShefToday shifts={shifts} />}
      {activeTab === 'team' && <ShefTeam team={team} shefId={user?.id} />}
      {activeTab === 'request' && <ShefRequestPersonnel shefId={user?.id} />}
    </div>
  )
}
