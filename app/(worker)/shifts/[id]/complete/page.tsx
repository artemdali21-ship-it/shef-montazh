'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { Star } from 'lucide-react'

export default function CompleteShiftPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const toast = useToast()

  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadShift()
  }, [])

  const loadShift = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single()

      if (error) throw error
      setShift(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Не удалось загрузить смену')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (rating === 0) {
      toast.error('Пожалуйста, поставьте оценку')
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/shifts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          userId: user.id,
          userRole: 'worker',
          rating,
          comment: comment.trim() || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete shift')
      }

      toast.success(result.message)
      router.push('/worker/shifts')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-white">Загрузка...</p></div>

  return (
    <div className="min-h-screen pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Завершить смену</h1>

        {shift && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">{shift.title}</h2>
            <p className="text-gray-400 text-sm">{shift.location_address}</p>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Оцените работу</h3>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (опционально)"
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        <button
          onClick={handleComplete}
          disabled={submitting || rating === 0}
          className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Завершаем...' : 'Подтвердить завершение'}
        </button>
      </div>
    </div>
  )
}
