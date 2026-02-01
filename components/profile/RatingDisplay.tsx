'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, User } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getUserReceivedRatings, calculateUserAverageRating } from '@/lib/api/ratings'

interface Rating {
  id: string
  rating: number
  comment: string | null
  created_at: string
  from_user: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
  shift: {
    id: string
    title: string
    date: string
  }
}

interface Props {
  userId: string
  initialRating?: number
}

export default function RatingDisplay({ userId, initialRating = 0 }: Props) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0])
  const [averageRating, setAverageRating] = useState(initialRating)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRatings()
  }, [userId])

  const loadRatings = async () => {
    try {
      setLoading(true)

      // Get latest 3 ratings with details
      const { data: ratingsData } = await getUserReceivedRatings(userId)

      if (ratingsData) {
        setRatings(ratingsData.slice(0, 3) as Rating[])
      }

      // Calculate distribution and average
      const { average, count } = await calculateUserAverageRating(userId)
      setAverageRating(average)
      setTotalCount(count)

      // Get all ratings for distribution
      const supabase = createClient()
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('to_user_id', userId)

      if (allRatings) {
        const dist = [0, 0, 0, 0, 0]
        allRatings.forEach((r: any) => {
          dist[r.rating - 1]++
        })
        setDistribution(dist)
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-24 bg-white/10 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-orange-400" />
        Рейтинг и отзывы
      </h2>

      {totalCount === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">Пока нет отзывов</p>
          <p className="text-sm text-gray-500 mt-1">
            Завершите первую смену, чтобы получить оценку
          </p>
        </div>
      ) : (
        <>
          {/* Average Rating Section */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b border-white/10">
            {/* Big Rating Number */}
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`${
                      star <= Math.round(averageRating)
                        ? 'fill-orange-500 text-orange-500'
                        : 'fill-none text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-400">
                {totalCount} {totalCount === 1 ? 'отзыв' : totalCount < 5 ? 'отзыва' : 'отзывов'}
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((starLevel) => {
                const count = distribution[starLevel - 1]
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0

                return (
                  <div key={starLevel} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm text-gray-400">{starLevel}</span>
                      <Star size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              Последние отзывы
            </h3>

            {ratings.length === 0 ? (
              <p className="text-sm text-gray-500">Нет отзывов с комментариями</p>
            ) : (
              <div className="space-y-4">
                {ratings.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    {/* Review Header */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                        {review.from_user.avatar_url ? (
                          <img
                            src={review.from_user.avatar_url}
                            alt={review.from_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">
                            {review.from_user.full_name}
                          </p>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                            {review.from_user.role === 'client' ? 'Заказчик' : 'Исполнитель'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= review.rating
                                    ? 'fill-orange-500 text-orange-500'
                                    : 'fill-none text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shift Info */}
                    <div className="text-xs text-gray-500 mb-2">
                      Смена: {review.shift.title} • {new Date(review.shift.date).toLocaleDateString('ru-RU')}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
