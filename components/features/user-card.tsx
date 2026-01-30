'use client'

import React from 'react';
import { MapPin, Award, CheckCircle, MessageSquare } from 'lucide-react';
import { CustomAvatar } from '../custom/custom-avatar';
import { CustomBadge } from '../custom/custom-badge';
import { CustomButton } from '../custom/custom-button';
import { StarRating } from '../rating/StarRating';

interface UserCardProps {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount?: number;
  completedShifts: number;
  reliability: number;
  location: string;
  specializations: string[];
  verified: boolean;
  online?: boolean;
  bio?: string;
  hasTools?: boolean;
  hourlyRate?: number;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  name,
  avatar,
  rating,
  reviewCount,
  completedShifts,
  reliability,
  location,
  specializations,
  verified,
  online,
  bio,
  hasTools,
  hourlyRate,
  onMessage,
  onViewProfile
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <CustomAvatar
          src={avatar}
          fallback={name.split(' ').map(n => n[0]).join('')}
          size="lg"
          online={online}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-montserrat font-700 text-white truncate">
              {name}
            </h3>
            {verified && (
              <CheckCircle className="w-4 h-4 text-[#BFFF00] flex-shrink-0" strokeWidth={1.5} />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <StarRating 
              rating={rating}
              reviewCount={reviewCount}
              size="md"
              showNumber={true}
            />
            <span className="text-sm text-[#9B9B9B] font-montserrat font-500">
              • {completedShifts} смен
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#9B9B9B]">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            <span className="font-montserrat font-500">{location}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-[#9B9B9B] font-montserrat font-500 mb-3 line-clamp-2">
          {bio}
        </p>
      )}

      {/* Specializations */}
      <div className="flex flex-wrap gap-2 mb-3">
        {specializations.slice(0, 3).map((spec, index) => (
          <CustomBadge key={index} variant="default" size="sm">
            {spec}
          </CustomBadge>
        ))}
        {specializations.length > 3 && (
          <CustomBadge variant="default" size="sm">
            +{specializations.length - 3}
          </CustomBadge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-white/10">
        <div className="text-center">
          <p className="text-lg font-montserrat font-800 text-white mb-1">
            {reliability}%
          </p>
          <p className="text-[10px] text-[#9B9B9B] font-montserrat font-500">
            Надёжность
          </p>
        </div>
        
        {hasTools !== undefined && (
          <div className="text-center">
            <p className="text-lg font-montserrat font-800 text-[#BFFF00] mb-1">
              {hasTools ? '✓' : '−'}
            </p>
            <p className="text-[10px] text-[#9B9B9B] font-montserrat font-500">
              Инструмент
            </p>
          </div>
        )}
        
        {hourlyRate && (
          <div className="text-center">
            <p className="text-lg font-montserrat font-800 text-[#E85D2F] mb-1">
              {hourlyRate} ₽
            </p>
            <p className="text-[10px] text-[#9B9B9B] font-montserrat font-500">
              за час
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onMessage && (
          <CustomButton
            variant="outline"
            size="sm"
            onClick={onMessage}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Написать
          </CustomButton>
        )}
        
        {onViewProfile && (
          <CustomButton
            variant="primary"
            size="sm"
            onClick={onViewProfile}
          >
            Профиль
          </CustomButton>
        )}
      </div>
    </div>
  );
};
