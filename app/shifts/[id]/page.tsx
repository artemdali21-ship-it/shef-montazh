'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users, Star, Briefcase } from 'lucide-react'
import { getShiftById, applyToShift } from '@/lib/api/shifts'

export default function ShiftDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    async function loadShift() {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: fetchError } = await getShiftById(shiftId)
        
        if (fetchError) throw fetchError
        if (!data) throw new Error('Смена не найдена')
        
        setShift(data)
      } catch (err) {
        console.error('Error loading shift:', err)
        setError('Не удалось загрузить информацию о смене')
      } finally {
        setLoading(false)
      }
    }

    if (shiftId) {
      loadShift()
    }
  }, [shiftId])

  const handleApply = async () => {
    try {
      setApplying(true)
      // Get worker ID from localStorage or context
      const workerId = localStorage.getItem('workerId') || 'worker-' + Math.random().toString(36).substr(2, 9)
      
      const { data, error: applyError } = await applyToShift(shiftId, workerId)
      
      if (applyError) {
        setError(applyError)
        return
      }

      setShowSuccess(true)
      // Navigate to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (err) {
      console.error('Error applying to shift:', err)
      setError('Не удалось подать отклик')
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !shift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
          <p className="text-red-400 text-center mb-4">{error || 'Смена не найдена'}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-32 overflow-y-scroll" data-allow-scroll>
      {/* Header */}
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Детали смены</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium mb-3">
              {shift.category}
            </span>
            <h2 className="text-2xl font-bold text-white mb-2">{shift.title}</h2>
          </div>

          {shift.description && (
            <p className="text-gray-300 text-sm leading-relaxed mb-4 pb-4 border-b border-white/10">
              {shift.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Локация</p>
                <p className="text-white font-medium">{shift.location_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Дата</p>
                <p className="text-white font-medium">{formatDate(shift.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Время</p>
                <p className="text-white font-medium">
                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </p>
              </div>
            </div>

            {shift.required_workers > 1 && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Требуется</p>
                  <p className="text-white font-medium">{shift.required_workers} человек</p>
                </div>
              </div>
            )}

            {shift.required_rating > 0 && (
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Минимальный рейтинг</p>
                  <p className="text-white font-medium">{shift.required_rating}+</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Оплата</p>
              <p className="text-3xl font-bold text-white">
                {shift.pay_amount.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">За смену</p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
            Статус: {shift.status === 'open' ? 'Открыта' : shift.status}
          </span>
        </div>
      </div>

      {/* Apply Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#2A2A2A]/95 backdrop-blur-xl border-t border-white/10">
        <button
          onClick={handleApply}
          disabled={applying}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition shadow-lg ${
            applying
              ? 'bg-orange-500/50 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
          }`}
        >
          {applying ? 'Отправляю отклик...' : 'Откликнуться на смену'}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2A2A2A] border border-green-500/30 rounded-2xl p-8 max-w-sm">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Отклик отправлен!</h3>
            <p className="text-gray-400 text-center text-sm">Заказчик получит вашу заявку и свяжется с вами</p>
          </div>
        </div>
      )}
    </div>
  )
}
