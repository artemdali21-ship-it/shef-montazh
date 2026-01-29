'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Calendar, DollarSign, Star } from 'lucide-react'
import Link from 'next/link'
import { getAllShifts } from '@/lib/api/shifts'
import { Shift } from '@/lib/supabase-types'

export default function FeedPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadShifts() {
      try {
        setLoading(true)
        setError(null)
        
        const data = await getAllShifts()
        const openShifts = data.filter((shift: Shift) => shift.status === 'open')
        setShifts(openShifts)
      } catch (err) {
        console.error('Error loading shifts:', err)
        setError('Не удалось загрузить смены. Попробуйте позже.')
      } finally {
        setLoading(false)
      }
    }

    loadShifts()
  }, [])

  const filteredShifts = shifts.filter(shift =>
    shift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.location_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Лента смен</h1>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, локации, категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-red-400 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 w-full py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет доступных смен'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Новые смены появятся скоро'}
            </p>
          </div>
        )}

        {!loading && !error && filteredShifts.length > 0 && (
          <div className="space-y-4">
            {filteredShifts.map((shift) => (
              <Link
                key={shift.id}
                href={`/shift/${shift.id}`}
                className="block bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {shift.title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      {shift.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-gray-300 text-sm mb-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span className="line-clamp-1">{shift.location_address}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatDate(shift.date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-xl font-bold text-white">
                      {shift.pay_amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  {shift.required_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>{shift.required_rating}+</span>
                    </div>
                  )}
                </div>

                {shift.required_workers > 1 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Требуется: {shift.required_workers} человек
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filteredShifts.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            Показано смен: {filteredShifts.length}
          </p>
        )}
      </div>
    </div>
  )
}
