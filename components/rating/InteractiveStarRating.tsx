'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface InteractiveStarRatingProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const RATING_LABELS: Record<number, string> = {
  1: 'Плохо',
  2: 'Ниже среднего',
  3: 'Средне',
  4: 'Хорошо',
  5: 'Отлично',
}

export default function InteractiveStarRating({
  value,
  onChange,
  size = 'lg',
  readonly = false,
}: InteractiveStarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0)

  const starSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size]

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoveredStar(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(0)
    }
  }

  const displayRating = hoveredStar || value

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= displayRating
          const isHovered = star <= hoveredStar

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`${starSize} transition-all duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`w-full h-full transition-all duration-200 ${
                  isActive
                    ? 'fill-orange-500 text-orange-500'
                    : 'fill-gray-600 text-gray-600'
                } ${isHovered && !readonly ? 'drop-shadow-lg' : ''}`}
              />
            </button>
          )
        })}
      </div>

      {/* Label */}
      {displayRating > 0 && (
        <div className="text-center">
          <p
            className={`font-semibold transition-all duration-200 ${
              displayRating >= 4
                ? 'text-green-400'
                : displayRating >= 3
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {RATING_LABELS[displayRating]}
          </p>
          <p className="text-sm text-gray-400 mt-1">{displayRating} из 5</p>
        </div>
      )}

      {/* Placeholder when no rating */}
      {displayRating === 0 && !readonly && (
        <p className="text-sm text-gray-500">Нажмите на звезду для оценки</p>
      )}
    </div>
  )
}
