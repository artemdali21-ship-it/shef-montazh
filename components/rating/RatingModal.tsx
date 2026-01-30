'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  shiftId: string
  fromUserId: string
  toUserId: string
  toUserName: string
  userType: 'worker' | 'client' // кто оценивает
}

export function RatingModal({
  isOpen,
  onClose,
  shiftId,
  fromUserId,
  toUserId,
  toUserName,
  userType,
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Пожалуйста, выберите оценку')
      return
    }

    try {
      setSubmitting(true)

      // 1. Check if rating already exists
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('shift_id', shiftId)
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .single()

      if (existingRating) {
        toast.error('Вы уже оценили эту смену')
        onClose()
        return
      }

      // 2. Insert rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          shift_id: shiftId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          rating,
          comment: comment.trim() || null,
          created_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      // 3. Get current user stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rating, total_shifts, successful_shifts')
        .eq('id', toUserId)
        .single()

      if (userError) throw userError

      // 4. Calculate new rating
      const currentRating = userData.rating || 0
      const totalShifts = userData.total_shifts || 0
      const successfulShifts = userData.successful_shifts || 0

      // Calculate new average rating
      const newRating = totalShifts === 0
        ? rating
        : (currentRating * totalShifts + rating) / (totalShifts + 1)

      // 5. Update user stats
      const { error: updateError } = await supabase
        .from('users')
        .update({
          rating: Number(newRating.toFixed(2)),
          total_shifts: totalShifts + 1,
          successful_shifts: successfulShifts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', toUserId)

      if (updateError) throw updateError

      // 6. Send notification to rated user
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: toUserId,
            type: 'rating_received',
            data: {
              messageName: userType === 'worker' ? 'Клиент' : 'Исполнитель',
              rating,
              messagePreview: comment.trim() || 'Без комментария',
            },
          }),
        })
      } catch (notifError) {
        console.error('Failed to send notification:', notifError)
      }

      // Success!
      setSuccess(true)
      toast.success('Оценка отправлена!')

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        // Reset state
        setTimeout(() => {
          setSuccess(false)
          setRating(0)
          setComment('')
        }, 300)
      }, 2000)

    } catch (err: any) {
      console.error('Error submitting rating:', err)
      toast.error(err.message || 'Не удалось отправить оценку')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStarClick = (value: number) => {
    setRating(value)
  }

  const handleStarHover = (value: number) => {
    setHoverRating(value)
  }

  const displayRating = hoverRating || rating

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-[#2A2A2A] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!success ? (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-h2 text-white">Оцените работу</h2>
                      <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors duration-200"
                        aria-label="Закрыть"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-body-small text-gray-400">
                      {userType === 'worker'
                        ? `Как прошла работа с ${toUserName}?`
                        : `Как работал ${toUserName}?`
                      }
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <motion.button
                          key={value}
                          onClick={() => handleStarClick(value)}
                          onMouseEnter={() => handleStarHover(value)}
                          onMouseLeave={() => handleStarHover(0)}
                          className="p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={submitting}
                        >
                          <Star
                            className={`w-12 h-12 transition-all duration-200 ${
                              value <= displayRating
                                ? 'text-[#E85D2F] fill-[#E85D2F]'
                                : 'text-gray-600'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>

                    {/* Rating Text */}
                    {rating > 0 && (
                      <motion.p
                        className="text-center text-body text-gray-300 mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {rating === 5 && 'Отлично! 🎉'}
                        {rating === 4 && 'Хорошо! 👍'}
                        {rating === 3 && 'Нормально'}
                        {rating === 2 && 'Не очень 😕'}
                        {rating === 1 && 'Плохо 😞'}
                      </motion.p>
                    )}

                    {/* Comment */}
                    <div className="mb-6">
                      <label className="block text-body-small text-gray-400 mb-2">
                        Комментарий (необязательно)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 200))}
                        placeholder="Расскажите о своём опыте..."
                        disabled={submitting}
                        rows={4}
                        maxLength={200}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors duration-200 resize-none disabled:opacity-50"
                      />
                      <p className="text-caption text-gray-500 mt-2 text-right">
                        {comment.length}/200
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={rating === 0 || submitting}
                      className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white font-bold text-body-large shadow-lg shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        'Отправить оценку'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <h3 className="text-h2 text-white mb-2">Спасибо за оценку!</h3>
                  <p className="text-body text-gray-400">
                    Ваш отзыв помогает улучшить сервис
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
