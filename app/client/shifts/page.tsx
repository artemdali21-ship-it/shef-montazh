'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { Logo } from '@/components/ui/Logo'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function ClientShiftsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadShifts()
    } else if (!sessionLoading && !session) {
      router.push('/')
    }
  }, [sessionLoading, session])

  const loadShifts = async () => {
    if (!session) return

    try {
      setLoading(true)

      const { data: shiftsData } = await supabase
        .from('shifts')
        .select(`
          *,
          applications:shift_applications(count)
        `)
        .eq('client_id', session.userId)
        .order('date', { ascending: false })

      setShifts(shiftsData || [])
    } catch (error) {
      console.error('Error loading shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка смен...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <div className="mb-3">
            <Logo size="md" showText={true} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Мои смены</h1>
          <p className="text-sm text-gray-400">Управление вашими сменами</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Create Shift Button */}
        <button
          onClick={() => router.push('/create-shift')}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать новую смену
        </button>

        {/* Shifts List */}
        {shifts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              У вас пока нет смен
            </h3>
            <p className="text-gray-400 mb-6">
              Создайте первую смену для найма исполнителей
            </p>
            <button
              onClick={() => router.push('/create-shift')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              <Plus className="w-5 h-5" />
              Создать смену
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-3"
              >
                <h3 className="text-lg font-bold text-white mb-2">{shift.title}</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{shift.location_address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(shift.date).toLocaleDateString('ru-RU')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{shift.start_time} - {shift.end_time}</span>
                  </div>

                  {shift.workers_needed && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Требуется: {shift.workers_needed} чел.</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      shift.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      shift.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      shift.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {shift.status === 'published' ? 'Опубликована' :
                       shift.status === 'in_progress' ? 'В работе' :
                       shift.status === 'completed' ? 'Завершена' :
                       'Черновик'}
                    </span>

                    {shift.applications && shift.applications.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {shift.applications[0].count} {shift.applications[0].count === 1 ? 'заявка' : 'заявок'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/shifts/${shift.id}/applications`)}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition btn-press"
                  >
                    Смотреть заявки {shift.applications && shift.applications[0]?.count > 0 ? `(${shift.applications[0].count})` : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
