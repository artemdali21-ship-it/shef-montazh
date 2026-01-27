'use client';
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        const isPartiallyFilled = starValue > displayRating && starValue - displayRating < 1;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform
            `}
          >
            {isPartiallyFilled ? (
              <div className="relative">
                <Star className={`${sizes[size]} text-[#9B9B9B]`} />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(displayRating % 1) * 100}%` }}
                >
                  <Star className={`${sizes[size]} text-[#FFD60A] fill-[#FFD60A]`} />
                </div>
              </div>
            ) : (
              <Star
                className={`
                  ${sizes[size]}
                  ${isFilled ? 'text-[#FFD60A] fill-[#FFD60A]' : 'text-[#9B9B9B]'}
                `}
              />
            )}
          </button>
        );
      })}
      
      {showValue && (
        <span className="text-sm font-montserrat font-700 text-white ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
