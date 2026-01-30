'use client'

import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number; // 0-5 with decimals
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showNumber = true,
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const displayRating = Math.min(Math.max(rating, 0), 5);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = starValue > displayRating && starValue - displayRating < 1;

          return (
            <div key={index} className="relative">
              {isPartiallyFilled ? (
                <>
                  <Star className={`${sizes[size]} text-[#666666]`} />
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <Star className={`${sizes[size]} text-[#E85D2F] fill-[#E85D2F]`} />
                  </div>
                </>
              ) : (
                <Star
                  className={`${sizes[size]} ${
                    isFilled
                      ? 'text-[#E85D2F] fill-[#E85D2F]'
                      : 'text-[#666666]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {showNumber && (
        <div className="flex items-center gap-1">
          <span className={`font-montserrat font-700 text-white ${textSizes[size]}`}>
            {displayRating.toFixed(1)}
          </span>
          {reviewCount !== undefined && (
            <span className={`font-montserrat font-500 text-[#9B9B9B] ${textSizes[size]}`}>
              ({reviewCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
