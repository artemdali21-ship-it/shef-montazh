'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptic'

export default function ShiftDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const toast = useToast()
  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    loadShift()
  }, [shiftId])

  const loadShift = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load shift details
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('*, client:users!shifts_client_id_fkey(full_name, avatar_url)')
        .eq('id', shiftId)
        .single()

      if (shiftError) throw shiftError

      setShift(shiftData)

      // Check if user has already applied and get full application data
      const { data: applicationData } = await supabase
        .from('shift_applications')
        .select('*')
        .eq('shift_id', shiftId)
        .eq('worker_id', user.id)
        .single()

      setApplication(applicationData)
    } catch (error) {
      console.error('Error loading shift:', error)
      toast.error('Не удалось загрузить смену')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    try {
      hapticLight()
      setApplying(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('shift_applications')
        .insert({
          shift_id: shiftId,
          worker_id: user.id,
          status: 'pending'
        })

      if (error) throw error

      hapticSuccess()
      toast.success('Заявка успешно отправлена!')
      loadShift()
    } catch (error: any) {
      console.error('Error applying:', error)
      hapticError()
      toast.error(error.message || 'Не удалось отправить заявку')
    } finally {
      setApplying(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      hapticLight()
      setCheckingIn(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Update application with check-in time
      const { error } = await supabase
        .from('shift_applications')
        .update({
          checked_in_at: new Date().toISOString()
        })
        .eq('id', application.id)

      if (error) throw error

      // Update shift status to in_progress if not already
      await supabase
        .from('shifts')
        .update({ status: 'in_progress' })
        .eq('id', shiftId)
        .eq('status', 'published')

      hapticSuccess()
      toast.success('Вы отметились на смене!')
      loadShift()
    } catch (error: any) {
      console.error('Error checking in:', error)
      hapticError()
      toast.error(error.message || 'Не удалось отметиться')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Смена не найдена</h2>
          <button
            onClick={() => router.back()}
            className="text-orange-500 hover:text-orange-400"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Детали смены</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Shift Title */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{shift.title}</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span>{shift.location_address}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>{new Date(shift.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-green-400" />
              <span>{shift.start_time} - {shift.end_time}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold text-orange-500">
                {shift.price?.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {shift.workers_needed && (
              <div className="flex items-center gap-3 text-gray-300">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Требуется: {shift.workers_needed} исполнителей</span>
              </div>
            )}

            {shift.category && (
              <div className="flex items-center gap-3 text-gray-300">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <span>{shift.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {shift.description && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-3">Описание</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{shift.description}</p>
          </div>
        )}

        {/* Client Info */}
        {shift.client && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-3">Заказчик</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                {shift.client.avatar_url ? (
                  <img
                    src={shift.client.avatar_url}
                    alt={shift.client.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  shift.client.full_name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{shift.client.full_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!application ? (
          // No application yet - show apply button
          <button
            onClick={handleApply}
            disabled={applying}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
              applying
                ? 'bg-orange-500/50 text-white cursor-wait'
                : 'bg-orange-500 hover:bg-orange-600 text-white btn-press'
            }`}
          >
            {applying ? 'Отправка...' : 'Откликнуться на смену'}
          </button>
        ) : application.status === 'pending' ? (
          // Application pending
          <div className="space-y-2">
            <div className="w-full py-4 rounded-xl font-semibold text-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-center">
              ⏳ Заявка на рассмотрении
            </div>
            <p className="text-center text-sm text-gray-400">
              Ожидайте ответа от заказчика
            </p>
          </div>
        ) : application.status === 'rejected' ? (
          // Application rejected
          <div className="w-full py-4 rounded-xl font-semibold text-lg bg-red-500/20 text-red-400 border border-red-500/50 text-center">
            ✗ Заявка отклонена
          </div>
        ) : application.status === 'accepted' && !application.checked_in_at ? (
          // Accepted but not checked in
          <div className="space-y-2">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                checkingIn
                  ? 'bg-green-500/50 text-white cursor-wait'
                  : 'bg-green-500 hover:bg-green-600 text-white btn-press'
              }`}
            >
              {checkingIn ? 'Отметка...' : '📍 Я прибыл на место'}
            </button>
            <p className="text-center text-sm text-gray-400">
              ✓ Вы одобрены! Отметьтесь по прибытии на смену
            </p>
          </div>
        ) : application.checked_in_at ? (
          // Checked in
          <div className="space-y-2">
            <div className="w-full py-4 rounded-xl font-semibold text-lg bg-green-500/20 text-green-400 border border-green-500/50 text-center">
              ✓ Вы на смене
            </div>
            <p className="text-center text-sm text-gray-400">
              Отметка: {new Date(application.checked_in_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
