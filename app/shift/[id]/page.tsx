'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users, Star,
  Briefcase, Shield, Wrench, CheckCircle, User
} from 'lucide-react'
import { getShiftById } from '@/lib/api/shifts'
import { getUserById } from '@/lib/api/users'
import { createApplication, checkExistingApplication, getPendingApplicationsCount } from '@/lib/api/applications'
import { ShiftStatus } from '@/components/shift/ShiftStatus'
import type { Tables } from '@/lib/supabase-types'

type Shift = Tables<'shifts'>
type User = Tables<'users'>

export default function ShiftDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string

  const [shift, setShift] = useState<Shift | null>(null)
  const [client, setClient] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0)

  // Mock worker ID - in production, get from auth context
  const MOCK_WORKER_ID = 'worker-123'
  // For testing: use client ID to see client view
  const MOCK_CLIENT_ID = 'client-456'
  const currentUserId = MOCK_WORKER_ID // Change to MOCK_CLIENT_ID to test client view

  useEffect(() => {
    async function loadShiftData() {
      try {
        setLoading(true)
        setError(null)

        // Load shift
        const { data: shiftData, error: shiftError } = await getShiftById(shiftId)

        if (shiftError) throw shiftError
        if (!shiftData) throw new Error('Смена не найдена')

        setShift(shiftData)

        // Load client info
        if (shiftData.client_id) {
          const { data: clientData, error: clientError } = await getUserById(shiftData.client_id)
          if (!clientError && clientData) {
            setClient(clientData)
          }
        }

        // Check if already applied (only for open shifts)
        if (shiftData.status === 'open') {
          const { data: applicationData } = await checkExistingApplication(shiftId, MOCK_WORKER_ID)
          if (applicationData) {
            setHasApplied(true)
          }
        }

        // Load pending applications count if user is shift owner
        if (shiftData.client_id === currentUserId) {
          const { count } = await getPendingApplicationsCount(shiftId)
          setPendingApplicationsCount(count || 0)
        }
      } catch (err) {
        console.error('Error loading shift:', err)
        setError('Не удалось загрузить информацию о смене')
      } finally {
        setLoading(false)
      }
    }

    if (shiftId) {
      loadShiftData()
    }
  }, [shiftId])

  const handleApply = async () => {
    if (!shift || hasApplied || shift.status !== 'open') return

    try {
      setApplying(true)

      const { data, error } = await createApplication({
        shift_id: shift.id,
        worker_id: MOCK_WORKER_ID,
        message: 'Здравствуйте! Хочу откликнуться на эту смену.'
      })

      if (error) {
        alert(error.message || 'Не удалось откликнуться на смену')
        return
      }

      setHasApplied(true)
      alert('Отклик успешно отправлен! Заказчик получит уведомление.')
    } catch (err) {
      console.error('Error applying:', err)
      alert('Произошла ошибка при отправке отклика')
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
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-32">
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
        {/* Client Info Card */}
        {client && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <p className="text-xs text-gray-400 mb-3">Заказчик</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {client.avatar_url ? (
                  <img
                    src={client.avatar_url}
                    alt={client.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  client.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{client.full_name}</h3>
                  {client.gosuslugi_verified && (
                    <Shield className="w-4 h-4 text-blue-400" />
                  )}
                  {client.is_verified && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-300">{(client.rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{client.total_shifts || 0} смен</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                {shift.category}
              </span>
              <ShiftStatus
                status={shift.status as 'open' | 'accepted' | 'on_way' | 'checked_in' | 'completed'}
                size="sm"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{shift.title}</h2>
          </div>

          {shift.description && (
            <div className="mb-4 pb-4 border-b border-white/10">
              <p className="text-xs text-gray-400 mb-2">Описание</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {shift.description}
              </p>
            </div>
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

            {shift.required_workers && shift.required_workers > 1 && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Требуется</p>
                  <p className="text-white font-medium">{shift.required_workers} человек</p>
                </div>
              </div>
            )}

            {shift.required_rating && shift.required_rating > 0 && (
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

        {/* Tools Required Card */}
        {shift.tools_required && shift.tools_required.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-orange-400" />
              <p className="text-white font-semibold">Требуемые инструменты</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {shift.tools_required.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements Card */}
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <p className="text-white font-semibold">Требования</p>
          </div>
          <ul className="space-y-2">
            {shift.required_rating && shift.required_rating > 0 ? (
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Рейтинг не ниже {shift.required_rating}</span>
              </li>
            ) : (
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Подходит для начинающих</span>
              </li>
            )}
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Приходить вовремя</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Выполнять работу качественно</span>
            </li>
          </ul>
        </div>

        {/* Payment Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Оплата</p>
              <p className="text-3xl font-bold text-white">
                {shift.pay_amount.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">За смену • Выплата после завершения</p>
        </div>

        {/* Applications Button - Only for shift owner */}
        {shift.client_id === currentUserId && (
          <button
            onClick={() => router.push(`/shifts/${shift.id}/applications`)}
            className="w-full py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            <span>Отклики ({pendingApplicationsCount})</span>
          </button>
        )}
      </div>

      {/* Apply Button - Fixed at bottom */}
      {shift.status === 'open' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#2A2A2A]/95 backdrop-blur-xl border-t border-white/10 max-w-screen-md mx-auto">
          {hasApplied ? (
            <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-bold text-lg text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Вы откликнулись на эту смену
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition shadow-lg shadow-orange-500/30"
            >
              {applying ? 'Отправка...' : 'Откликнуться'}
            </button>
          )}
        </div>
      )}

      {shift.status !== 'open' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#2A2A2A]/95 backdrop-blur-xl border-t border-white/10 max-w-screen-md mx-auto">
          <div className="w-full py-4 bg-gray-500/20 border border-gray-500/30 rounded-xl text-gray-400 font-bold text-lg text-center">
            {shift.status === 'completed' && 'Смена завершена'}
            {shift.status === 'cancelled' && 'Смена отменена'}
            {shift.status === 'in_progress' && 'Смена в процессе'}
            {!['open', 'completed', 'cancelled', 'in_progress'].includes(shift.status || '') && 'Смена недоступна'}
          </div>
        </div>
      )}
    </div>
  )
}
