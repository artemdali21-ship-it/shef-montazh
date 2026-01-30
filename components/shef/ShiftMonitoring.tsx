'use client'

import { Calendar, MapPin, Clock, CheckCircle, Image as ImageIcon, User } from 'lucide-react'

interface ShiftWorker {
  id: string
  status: 'confirmed' | 'on_way' | 'checked_in' | 'checked_out'
  check_in_time: string | null
  check_in_photo_url: string | null
  check_in_lat: number | null
  check_in_lng: number | null
  worker: {
    id: string
    full_name: string
    avatar_url: string | null
    phone: string
    rating: number
  }
}

interface ShiftWithWorkers {
  id: string
  title: string
  category: string
  location_address: string
  date: string
  start_time: string
  end_time: string
  status: string
  workers: ShiftWorker[]
}

interface ShiftMonitoringProps {
  shift: ShiftWithWorkers
  onComplete?: (shiftId: string) => void
}

const STATUS_CONFIG = {
  confirmed: {
    label: 'Назначен',
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
  },
  on_way: {
    label: 'В пути',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
  },
  checked_in: {
    label: 'На месте',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
  },
  checked_out: {
    label: 'Ушел',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
  },
}

export default function ShiftMonitoring({ shift, onComplete }: ShiftMonitoringProps) {
  const allCheckedIn = shift.workers.every((w) => w.status === 'checked_in')

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  const formatCheckInTime = (isoStr: string | null) => {
    if (!isoStr) return '—'
    const date = new Date(isoStr)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Shift Info */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{shift.title}</h3>
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
              {shift.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {new Date(shift.date).toLocaleDateString('ru-RU')} •{' '}
              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{shift.location_address}</span>
          </div>
        </div>
      </div>

      {/* Workers Status */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Работники ({shift.workers.length})</h4>
          <div className="text-xs text-gray-400">
            {shift.workers.filter((w) => w.status === 'checked_in').length} на месте
          </div>
        </div>

        {shift.workers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Нет назначенных работников</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shift.workers.map((worker) => {
              const statusConfig = STATUS_CONFIG[worker.status]

              return (
                <div
                  key={worker.id}
                  className={`p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                      {worker.worker.avatar_url ? (
                        <img
                          src={worker.worker.avatar_url}
                          alt={worker.worker.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {worker.worker.full_name}
                          </p>
                          <p className="text-xs text-gray-400">{worker.worker.phone}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Check-in details */}
                      {worker.check_in_time && (
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatCheckInTime(worker.check_in_time)}</span>
                          </div>
                          {worker.check_in_photo_url && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              <a
                                href={worker.check_in_photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                Фото
                              </a>
                            </div>
                          )}
                          {worker.check_in_lat && worker.check_in_lng && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {worker.check_in_lat.toFixed(4)}, {worker.check_in_lng.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Complete Button */}
      {onComplete && (
        <button
          onClick={() => onComplete(shift.id)}
          disabled={!allCheckedIn}
          className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2 ${
            allCheckedIn
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
              : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-6 h-6" />
          {allCheckedIn ? 'Завершить смену' : 'Ожидание работников'}
        </button>
      )}
    </div>
  )
}
