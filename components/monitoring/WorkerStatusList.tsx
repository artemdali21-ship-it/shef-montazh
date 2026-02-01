'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { MapPin, Clock, AlertCircle, CheckCircle, User, Shield, Star, X } from 'lucide-react'
import { getShiftWorkers, type ShiftWorker } from '@/lib/api/shift-workers'

interface WorkerWithProfile extends ShiftWorker {
  worker: {
    id: string
    full_name: string
    avatar_url: string | null
    phone: string
    rating: number | null
    gosuslugi_verified: boolean
  }
}

interface Props {
  shiftId: string
  shiftStartTime: string
  shiftDate: string
}

export default function WorkerStatusList({ shiftId, shiftStartTime, shiftDate }: Props) {
  const supabase = createClient()
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkers()
    subscribeToUpdates()

    return () => {
      supabase.channel('shift-workers-updates').unsubscribe()
    }
  }, [shiftId])

  const loadWorkers = async () => {
    try {
      const { data, error } = await getShiftWorkers(shiftId)
      if (error) throw error

      setWorkers(data as WorkerWithProfile[] || [])
    } catch (error) {
      console.error('Error loading workers:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('shift-workers-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'shift_workers',
        filter: `shift_id=eq.${shiftId}`
      }, () => {
        loadWorkers()
      })
      .subscribe()
  }

  const getStatusInfo = (status: string, checkInTime: string | null) => {
    switch (status) {
      case 'checked_in':
        return {
          label: 'На месте',
          color: 'bg-green-500',
          dotColor: 'bg-green-500',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckCircle
        }
      case 'on_way':
        return {
          label: 'В пути',
          color: 'bg-orange-500',
          dotColor: 'bg-orange-500',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          icon: MapPin
        }
      case 'checked_out':
        return {
          label: 'Завершил',
          color: 'bg-blue-500',
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          icon: CheckCircle
        }
      case 'completed':
        return {
          label: 'Выполнено',
          color: 'bg-purple-500',
          dotColor: 'bg-purple-500',
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          icon: CheckCircle
        }
      default:
        return {
          label: 'Подтверждён',
          color: 'bg-gray-500',
          dotColor: 'bg-gray-500',
          textColor: 'text-gray-400',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          icon: Clock
        }
    }
  }

  const isLate = (checkInTime: string | null) => {
    if (!checkInTime) return false

    const checkIn = new Date(checkInTime)
    const shiftStart = new Date(`${shiftDate}T${shiftStartTime}`)
    const thirtyMinutesLate = shiftStart.getTime() + 30 * 60 * 1000

    return checkIn.getTime() > thirtyMinutesLate
  }

  const getLateMinutes = (checkInTime: string | null) => {
    if (!checkInTime) return 0

    const checkIn = new Date(checkInTime)
    const shiftStart = new Date(`${shiftDate}T${shiftStartTime}`)
    const diffMs = checkIn.getTime() - shiftStart.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    return diffMins > 0 ? diffMins : 0
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (workers.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Нет назначенных исполнителей</h3>
        <p className="text-gray-400 text-sm">
          Назначьте исполнителей из списка откликов
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {workers.map((item) => {
          const statusInfo = getStatusInfo(item.status, item.check_in_time)
          const Icon = statusInfo.icon
          const late = isLate(item.check_in_time)
          const lateMinutes = getLateMinutes(item.check_in_time)

          return (
            <div
              key={item.id}
              className={`bg-white/5 backdrop-blur-xl rounded-2xl border ${statusInfo.borderColor} p-5`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                  {item.worker?.avatar_url ? (
                    <img
                      src={item.worker.avatar_url}
                      alt={item.worker.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {item.worker?.full_name || 'Неизвестно'}
                    </h3>
                    {item.worker?.gosuslugi_verified && (
                      <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{item.worker?.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-xl flex-shrink-0`}>
                  <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor} ${item.status === 'on_way' || item.status === 'checked_in' ? 'animate-pulse' : ''}`} />
                  <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Check-in Info */}
              {item.check_in_time && (
                <div className={`flex items-center gap-2 mb-3 text-sm ${late ? 'text-red-400' : 'text-gray-300'}`}>
                  <Clock className="w-4 h-4" />
                  <span>
                    Отметился: {new Date(item.check_in_time).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {late && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Опоздал на {lateMinutes} мин</span>
                    </div>
                  )}
                </div>
              )}

              {/* Late Warning */}
              {!item.check_in_time && item.status === 'confirmed' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-3">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Ожидается отметка</p>
                    <p className="text-yellow-400/70 text-xs mt-1">
                      Исполнитель должен отметиться за 30 минут до начала
                    </p>
                  </div>
                </div>
              )}

              {/* Check-in Photo */}
              {item.check_in_photo_url && (
                <button
                  onClick={() => setSelectedPhoto(item.check_in_photo_url)}
                  className="w-full rounded-xl overflow-hidden hover:opacity-90 transition"
                >
                  <img
                    src={item.check_in_photo_url}
                    alt="Check-in photo"
                    className="w-full h-40 object-cover"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Нажмите для увеличения
                  </p>
                </button>
              )}

              {/* Location Coordinates (if available) */}
              {item.check_in_lat && item.check_in_lng && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {item.check_in_lat.toFixed(6)}, {item.check_in_lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={selectedPhoto}
            alt="Check-in photo"
            className="max-w-full max-h-full rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
