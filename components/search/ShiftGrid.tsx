'use client'

import { useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, Star, Briefcase, User } from 'lucide-react'
import { ShiftSearchResult } from '@/lib/api/search'

interface ShiftGridProps {
  shifts: ShiftSearchResult[]
  loading?: boolean
}

export default function ShiftGrid({ shifts, loading }: ShiftGridProps) {
  const router = useRouter()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 animate-pulse"
          >
            <div className="h-6 bg-white/10 rounded mb-3" />
            <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (shifts.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
        <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Смены не найдены
        </h3>
        <p className="text-gray-400">
          Попробуйте изменить фильтры или сбросить их
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          onClick={() => router.push(`/shift/${shift.id}`)}
          className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer"
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
              {shift.title}
            </h3>
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
              {shift.category}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2.5 mb-4">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {formatDate(shift.date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{shift.location_address}</span>
            </div>

            {/* Client */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{shift.client_name}</span>
              {shift.client_rating > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">
                    {shift.client_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Pay */}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-green-400 font-bold text-base">
                {shift.pay_amount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {/* Description Preview */}
          {shift.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {shift.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {shift.required_workers && (
              <span className="text-xs text-gray-400">
                Требуется: {shift.required_workers} чел.
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/shift/${shift.id}`)
              }}
              className="px-4 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-semibold transition"
            >
              Подробнее
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
