'use client'

import { Star, User, Calendar, Briefcase } from 'lucide-react'

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
  ratings: Rating[]
  loading?: boolean
}

export default function RatingsList({ ratings, loading = false }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatShiftDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl h-40 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Пока нет отзывов</h3>
        <p className="text-gray-400 text-sm">
          Отзывы появятся после завершения смен
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating.id}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
              {rating.from_user.avatar_url ? (
                <img
                  src={rating.from_user.avatar_url}
                  alt={rating.from_user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate">
                  {rating.from_user.full_name}
                </h3>
                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400 flex-shrink-0">
                  {rating.from_user.role === 'client' ? 'Заказчик' : 'Исполнитель'}
                </span>
              </div>

              {/* Stars and Date */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={`${
                        star <= rating.rating
                          ? 'fill-orange-500 text-orange-500'
                          : 'fill-none text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(rating.created_at)}
                </div>
              </div>
            </div>

            {/* Rating Number Badge */}
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg flex-shrink-0">
              <Star size={16} className="fill-orange-400 text-orange-400" />
              <span className="text-orange-400 font-bold">{rating.rating}.0</span>
            </div>
          </div>

          {/* Shift Info */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-400 truncate">{rating.shift.title}</p>
            </div>
            <span className="text-xs text-blue-400/70 flex-shrink-0">
              {formatShiftDate(rating.shift.date)}
            </span>
          </div>

          {/* Comment */}
          {rating.comment && (
            <div className="pl-3 border-l-2 border-orange-500/30">
              <p className="text-sm text-gray-300 leading-relaxed">
                "{rating.comment}"
              </p>
            </div>
          )}

          {!rating.comment && (
            <p className="text-xs text-gray-500 italic">Без комментария</p>
          )}
        </div>
      ))}
    </div>
  )
}
