'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Clock, MapPin, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ShiftEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  pay_amount: number
  location: string
  client_name: string
  type?: 'shift' | 'blocked'
}

interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

interface Props {
  date: Date
  shifts: ShiftEvent[]
  onBackToCalendar: () => void
  blockedDates?: BlockedDate[]
  onDeleteBlock?: (blockId: string) => void
}

export default function DayView({ date, shifts, onBackToCalendar, blockedDates = [], onDeleteBlock }: Props) {
  // Filter shifts for selected date
  const dayShifts = shifts.filter(shift => {
    const shiftDate = format(shift.start, 'yyyy-MM-dd')
    const selectedDate = format(date, 'yyyy-MM-dd')
    return shiftDate === selectedDate
  })

  const getStatusConfig = (status: string, type?: string) => {
    if (type === 'blocked') {
      return {
        icon: XCircle,
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/30',
        label: 'Я занят'
      }
    }

    switch (status) {
      case 'assigned':
        return {
          icon: AlertCircle,
          color: 'text-orange-400',
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/30',
          label: 'Назначена'
        }
      case 'checked_in':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          label: 'Отмечен'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-600/20',
          border: 'border-green-600/30',
          label: 'Завершена'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          label: 'Отменена'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          label: 'Неизвестно'
        }
    }
  }

  return (
    <div className="min-h-screen bg-dashboard p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBackToCalendar}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад к календарю</span>
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            {format(date, 'd MMMM yyyy', { locale: ru })}
          </h1>
          <p className="text-gray-400">
            {dayShifts.length === 0
              ? 'Нет смен'
              : `${dayShifts.length} ${
                  dayShifts.length === 1 ? 'смена' : dayShifts.length < 5 ? 'смены' : 'смен'
                }`}
          </p>
        </div>

        {/* Shifts List */}
        {dayShifts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">На этот день смен не запланировано</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayShifts
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((shift) => {
                const statusConfig = getStatusConfig(shift.status, shift.type)
                const StatusIcon = statusConfig.icon
                const isBlocked = shift.type === 'blocked'

                // For blocked dates, find the block ID
                const blockId = isBlocked ? shift.id.split('-')[1] : null

                const Component = isBlocked ? 'div' : Link

                return (
                  <Component
                    key={shift.id}
                    {...(!isBlocked && { href: `/shifts/${shift.id}` })}
                    className="block bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{shift.title}</h3>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}
                        >
                          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                          <span className={`text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400">
                          {shift.pay_amount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {!isBlocked ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-300">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span>
                              {format(shift.start, 'HH:mm')} - {format(shift.end, 'HH:mm')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-gray-300">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{shift.location}</span>
                          </div>

                          <div className="flex items-center gap-3 text-gray-300">
                            <User className="w-5 h-5 text-gray-400" />
                            <span>Заказчик: {shift.client_name}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <span className="text-orange-400 font-medium flex items-center gap-2">
                            Подробнее
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Весь день заблокирован
                        </span>
                        {blockId && onDeleteBlock && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteBlock(blockId)
                            }}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/30"
                          >
                            Удалить блокировку
                          </button>
                        )}
                      </div>
                    )}
                  </Component>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
