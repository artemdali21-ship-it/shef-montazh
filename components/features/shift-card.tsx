'use client';
import React from 'react';
import { Clock, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';
import { CustomBadge } from '../custom/custom-badge';

export type ShiftStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

interface ShiftCardProps {
  id: string;
  title: string;
  client: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  workers: number;
  totalWorkers: number;
  rate: number;
  status: ShiftStatus;
  category: string;
  requiresCheckIn?: boolean;
  onClick?: () => void;
}

const statusConfig: Record<ShiftStatus, { label: string; color: string }> = {
  upcoming: { label: 'Предстоит', color: 'bg-blue-500/10 text-blue-400' },
  active: { label: 'Активна', color: 'bg-green-500/10 text-green-400' },
  completed: { label: 'Завершена', color: 'bg-green-500/10 text-green-400' },
  cancelled: { label: 'Отменена', color: 'bg-red-500/10 text-red-400' }
};

export const ShiftCard: React.FC<ShiftCardProps> = ({
  title,
  client,
  location,
  date,
  time,
  duration,
  workers,
  totalWorkers,
  rate,
  status,
  category,
  requiresCheckIn = false,
  onClick
}) => {
  const isUrgent = status === 'upcoming' && requiresCheckIn;
  const statusInfo = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className={`
        bg-white/5 border rounded-xl p-4 cursor-pointer transition-all
        hover:border-[#E85D2F]/50 active:scale-[0.98]
        ${isUrgent ? 'border-[#FFD60A]/50 bg-[#FFD60A]/5' : 'border-white/10'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-montserrat font-700 text-white truncate flex-1">
              {title}
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-montserrat font-800 ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
          </div>
          
          <p className="text-sm text-[#9B9B9B] font-montserrat font-500 mb-1">
            {client}
          </p>
          
          <CustomBadge variant="default" size="sm">
            {category}
          </CustomBadge>
        </div>
      </div>

      {/* Alert for check-in */}
      {isUrgent && (
        <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#FFD60A] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#FFD60A] font-montserrat font-600">
            Требуется check-in через {time.split(':')[0]}ч {time.split(':')[1]}м
          </p>
        </div>
      )}

      {/* Info Grid */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#9B9B9B]" />
          <span className="text-sm text-white font-montserrat font-500 truncate">
            {location}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#9B9B9B]" />
          <span className="text-sm text-white font-montserrat font-500">
            {date} • {time} ({duration})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#9B9B9B]" />
          <span className="text-sm text-white font-montserrat font-500">
            {workers}/{totalWorkers} монтажников
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1 text-[#9B9B9B]">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm font-montserrat font-500">Оплата</span>
        </div>
        
        <div className="text-right">
          <p className="text-xl font-montserrat font-800 text-[#E85D2F]">
            {rate.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>
    </div>
  );
};
