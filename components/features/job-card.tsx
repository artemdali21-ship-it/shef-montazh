'use client';
import React from 'react';
import { MapPin, Clock, Wrench, TrendingUp, ChevronRight } from 'lucide-react';
import { CustomAvatar } from '../custom/custom-avatar';
import { CustomBadge } from '../custom/custom-badge';

interface JobCardProps {
  id: string;
  title: string;
  client: {
    name: string;
    avatar?: string;
    rating: number;
  };
  location: string;
  date: string;
  time: string;
  duration: string;
  rate: number;
  category: string;
  toolsRequired: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  urgent?: boolean;
  premium?: boolean;
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  client,
  location,
  date,
  time,
  duration,
  rate,
  category,
  toolsRequired,
  difficulty = 'medium',
  urgent = false,
  premium = false,
  onClick
}) => {
  const difficultyColors = {
    easy: 'bg-[#BFFF00]/10 text-[#BFFF00]',
    medium: 'bg-[#FFD60A]/10 text-[#FFD60A]',
    hard: 'bg-red-500/10 text-red-500'
  };

  const difficultyLabels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white/5 border rounded-xl p-4 cursor-pointer transition-all
        hover:border-[#E85D2F]/50 active:scale-[0.98]
        ${premium ? 'border-[#FFD60A]/50 bg-gradient-to-br from-[#FFD60A]/5 to-transparent' : 'border-white/10'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <CustomAvatar
            src={client.avatar}
            fallback={client.name.split(' ').map(n => n[0]).join('')}
            size="md"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-montserrat font-700 text-white mb-1 truncate">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#9B9B9B] font-montserrat font-500 truncate">
                {client.name}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-[#FFD60A]">★</span>
                <span className="text-sm text-white font-montserrat font-600">
                  {client.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <CustomBadge variant="default" size="sm">{category}</CustomBadge>
        
        {toolsRequired && (
          <CustomBadge variant="info" size="sm">
            <Wrench className="w-3 h-3 mr-1" />
            Свой инструмент
          </CustomBadge>
        )}
        
        {urgent && (
          <CustomBadge variant="warning" size="sm">Срочно</CustomBadge>
        )}
        
        {premium && (
          <CustomBadge variant="warning" size="sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            VIP
          </CustomBadge>
        )}

        <div className={`px-2 py-0.5 rounded-full text-[10px] font-montserrat font-800 ${difficultyColors[difficulty]}`}>
          {difficultyLabels[difficulty]}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#9B9B9B]" />
          <span className="text-sm text-white font-montserrat font-500 truncate">
            {location}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#9B9B9B]" />
          <span className="text-sm text-white font-montserrat font-500">
            {duration}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#9B9B9B] font-montserrat font-500 mb-1">
            {date} • {time}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-montserrat font-800 text-[#E85D2F]">
            {rate.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-xs text-[#9B9B9B] font-montserrat font-500">
            за смену
          </p>
        </div>
      </div>
    </div>
  );
};
