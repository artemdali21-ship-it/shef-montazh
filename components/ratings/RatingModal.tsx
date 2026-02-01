'use client'

import { useState } from 'react'
import { Star, X, User } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { createRating, updateUserRating } from '@/lib/api/ratings'

interface Props {
  shiftId: string
  fromUserId: string
  toUserId: string
  toUserName: string
  toUserAvatar?: string | null
  onClose: () => void
  onSubmit: () => void
}

export default function RatingModal({
  shiftId,
  fromUserId,
  toUserId,
  toUserName,
  toUserAvatar,
  onClose,
  onSubmit
}: Props) {
  const toast = useToast()

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Пожалуйста, выберите оценку')
      return
    }

    try {
      setLoading(true)

      // Create rating
      const { error: ratingError } = await createRating({
        shift_id: shiftId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        rating,
        comment: comment.trim() || undefined
      })

      if (ratingError) throw ratingError

      // Update user's average rating
      await updateUserRating(toUserId)

      toast.success('Оценка успешно отправлена!')
      onSubmit()
      onClose()
    } catch (error: any) {
      console.error('Rating error:', error)
      toast.error(error.message || 'Не удалось отправить оценку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-2xl max-w-md w-full p-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Оцените работу</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
            {toUserAvatar ? (
              <img
                src={toUserAvatar}
                alt={toUserName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">{toUserName}</h3>
          <p className="text-sm text-gray-400 mt-1">Поставьте оценку исполнителю</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
              disabled={loading}
            >
              <Star
                size={48}
                className={`transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-orange-500 text-orange-500'
                    : 'fill-none text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Label */}
        {rating > 0 && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">
              {rating === 5 && 'Отлично! ⭐'}
              {rating === 4 && 'Хорошо! 👍'}
              {rating === 3 && 'Нормально 👌'}
              {rating === 2 && 'Плохо 👎'}
              {rating === 1 && 'Очень плохо 😞'}
            </p>
          </div>
        )}

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Комментарий (необязательно)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 200))}
            maxLength={200}
            placeholder="Поделитесь впечатлениями о работе..."
            disabled={loading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500/50 transition"
            rows={3}
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/200
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 active:scale-95 rounded-xl text-white font-bold text-lg transition-all"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Отправка...
            </div>
          ) : (
            'Отправить оценку'
          )}
        </button>

        {rating === 0 && (
          <p className="text-center text-xs text-gray-500 mt-3">
            Выберите количество звёзд
          </p>
        )}
      </div>
    </div>
  )
}
