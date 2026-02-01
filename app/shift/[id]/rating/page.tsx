'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { getShiftById } from '@/lib/api/shifts'
import { getUserById } from '@/lib/api/users'
import { getWorkerShiftStatus } from '@/lib/api/shift-workers'
import { createRating, getRating, canRate, updateUserRating } from '@/lib/api/ratings'
import InteractiveStarRating from '@/components/rating/InteractiveStarRating'
import type { Tables } from '@/lib/supabase-types'

type Shift = Tables<'shifts'>
type User = Tables<'users'>

export default function RatingPage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string

  // Mock user ID - in production, get from auth context
  const MOCK_WORKER_ID = 'worker-123'
  const MOCK_CLIENT_ID = 'client-456'
  // Change this to test different views
  const currentUserId = MOCK_WORKER_ID

  const [shift, setShift] = useState<Shift | null>(null)
  const [userToRate, setUserToRate] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')

  // User role
  const [isWorker, setIsWorker] = useState(false)

  useEffect(() => {
    loadRatingData()
  }, [shiftId])

  const loadRatingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load shift
      const { data: shiftData, error: shiftError } = await getShiftById(shiftId)
      if (shiftError) throw shiftError
      if (!shiftData) throw new Error('Смена не найдена')

      setShift(shiftData)

      // Check if user can rate
      const { canRate: canRateResult, error: canRateError } = await canRate(
        shiftId,
        currentUserId
      )

      if (canRateError || !canRateResult) {
        setError('Вы не можете оценить эту смену')
        return
      }

      // Determine who to rate
      let userIdToRate: string | null = null

      // If current user is the client, rate the worker
      if (shiftData.client_id === currentUserId) {
        setIsWorker(false)
        // Get worker from shift_workers
        const { data: workerStatus } = await getWorkerShiftStatus(shiftId, MOCK_WORKER_ID)
        if (workerStatus) {
          userIdToRate = workerStatus.worker_id
        }
      } else {
        // Current user is worker, rate the client
        setIsWorker(true)
        userIdToRate = shiftData.client_id
      }

      if (!userIdToRate) {
        setError('Не удалось определить кого оценивать')
        return
      }

      // Load user to rate
      const { data: userData, error: userError } = await getUserById(userIdToRate)
      if (userError) throw userError
      if (!userData) throw new Error('Пользователь не найден')

      setUserToRate(userData)

      // Check if already rated
      const { data: existingRating } = await getRating(
        shiftId,
        currentUserId,
        userIdToRate
      )

      if (existingRating) {
        setError('Вы уже оценили эту смену')
        setTimeout(() => router.push(`/shift/${shiftId}`), 2000)
        return
      }
    } catch (err: any) {
      console.error('Error loading rating data:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Пожалуйста, выберите оценку')
      return
    }

    if (!userToRate) {
      alert('Ошибка: не определен пользователь для оценки')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Create rating
      const { error: ratingError } = await createRating({
        shift_id: shiftId,
        from_user_id: currentUserId,
        to_user_id: userToRate.id,
        rating,
        comment: comment.trim() || undefined,
      })

      if (ratingError) {
        throw new Error('Не удалось сохранить оценку')
      }

      // Update user's average rating
      await updateUserRating(userToRate.id)

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push(`/shift/${shiftId}`)
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting rating:', err)
      setError(err.message || 'Произошла ошибка при отправке оценки')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
        <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Спасибо за оценку!</h2>
          <p className="text-gray-300">Ваш отзыв сохранен</p>
        </div>
      </div>
    )
  }

  if (error && !shift) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition font-semibold"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Оценить смену</h1>
            {shift && (
              <p className="text-sm text-gray-400 truncate">{shift.title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User to Rate Card */}
        {userToRate && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-gray-400 mb-4 text-center">
              {isWorker ? 'Вы оцениваете заказчика' : 'Вы оцениваете работника'}
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {userToRate.avatar_url ? (
                  <img
                    src={userToRate.avatar_url}
                    alt={userToRate.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">
                  {userToRate.full_name}
                </h3>
                <p className="text-sm text-gray-400">
                  {userToRate.role === 'worker' ? 'Работник' : 'Заказчик'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rating Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">
            Поставьте оценку
          </h2>
          <InteractiveStarRating value={rating} onChange={setRating} />
        </div>

        {/* Comment Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Комментарий (необязательно)
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Расскажите о своем опыте работы..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {comment.length}/500 символов
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl text-white font-bold text-lg transition shadow-lg shadow-orange-500/30 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Отправка...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Отправить оценку
            </>
          )}
        </button>

        {rating === 0 && (
          <p className="text-center text-sm text-gray-500">
            Выберите оценку для продолжения
          </p>
        )}
      </div>
    </div>
  )
}
