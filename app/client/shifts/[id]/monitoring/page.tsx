'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Users, Eye, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { getShiftById } from '@/lib/api/shifts'
import WorkerStatusList from '@/components/monitoring/WorkerStatusList'
import AssignTeamButton from '@/components/shifts/AssignTeamButton'

export default function MonitoringPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const supabase = createClient()

  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadShift()
  }, [shiftId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUserId(user.id)
  }

  const loadShift = async () => {
    try {
      const { data, error } = await getShiftById(shiftId)
      if (error) throw error

      setShift(data)
    } catch (error: any) {
      console.error('Error loading shift:', error)
      toast.error(error.message || 'Не удалось загрузить смену')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    toast.info('Обновление данных...')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Смена не найдена</p>
          <button
            onClick={() => router.back()}
            className="text-orange-400 hover:text-orange-300"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Мониторинг исполнителей</h1>
            <p className="text-sm text-gray-400">{shift.title}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Shift Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Информация о смене</h3>
              <p className="text-xs text-gray-400">Live-отслеживание</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Дата</p>
              <p className="text-white font-medium">{formatDate(shift.date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Время</p>
              <p className="text-white font-medium">
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Локация</p>
              <p className="text-white font-medium text-sm truncate">{shift.location_address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Требуется</p>
              <p className="text-white font-medium">{shift.required_workers} человек</p>
            </div>
          </div>
        </div>

        {/* Assign Team Button */}
        {userId && (
          <div className="mb-6">
            <AssignTeamButton
              shiftId={shiftId}
              clientId={userId}
              onSuccess={() => {
                setRefreshKey(prev => prev + 1)
                loadShift()
              }}
            />
          </div>
        )}

        {/* Status Legend */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Статусы исполнителей
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Подтверждён</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">В пути</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">На месте</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Выполнено</span>
            </div>
          </div>
        </div>

        {/* Real-time Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-blue-400 text-sm">
              Данные обновляются автоматически в реальном времени
            </p>
          </div>
        </div>

        {/* Worker Status List */}
        <WorkerStatusList
          key={refreshKey}
          shiftId={shiftId}
          shiftStartTime={shift.start_time}
          shiftDate={shift.date}
        />
      </div>
    </div>
  )
}
