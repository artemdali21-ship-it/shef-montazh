'use client';
import React from 'react';
import { Circle, CheckCircle, Navigation, MapPin, CheckCircle2 } from 'lucide-react';

export interface ShiftStatusProps {
  status: 'open' | 'accepted' | 'on_way' | 'checked_in' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  open: {
    color: '#6B7280',
    icon: Circle,
    text: 'Открыта',
    bgGlass: 'bg-gray-500/20',
    borderGlass: 'border-gray-500/30',
    textColor: 'text-gray-300',
  },
  accepted: {
    color: '#3B82F6',
    icon: CheckCircle,
    text: 'Принята',
    bgGlass: 'bg-blue-500/20',
    borderGlass: 'border-blue-500/30',
    textColor: 'text-blue-300',
  },
  on_way: {
    color: '#E85D2F',
    icon: Navigation,
    text: 'В пути',
    bgGlass: 'bg-orange-500/20',
    borderGlass: 'border-orange-500/30',
    textColor: 'text-orange-300',
  },
  checked_in: {
    color: '#10B981',
    icon: MapPin,
    text: 'На месте',
    bgGlass: 'bg-emerald-500/20',
    borderGlass: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
  },
  completed: {
    color: '#059669',
    icon: CheckCircle2,
    text: 'Завершена',
    bgGlass: 'bg-teal-600/20',
    borderGlass: 'border-teal-600/30',
    textColor: 'text-teal-300',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-3 py-1.5',
    iconSize: 14,
    fontSize: 'text-xs',
    gap: 'gap-2',
  },
  md: {
    padding: 'px-4 py-2',
    iconSize: 16,
    fontSize: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    padding: 'px-6 py-3',
    iconSize: 20,
    fontSize: 'text-base',
    gap: 'gap-3',
  },
};

export const ShiftStatus: React.FC<ShiftStatusProps> = React.memo(
  ({ status, size = 'md' }) => {
    const config = statusConfig[status];
    const sizeClass = sizeConfig[size];
    const IconComponent = config.icon;

    return (
      <div
        className={`
          inline-flex items-center
          ${sizeClass.padding}
          ${sizeClass.gap}
          ${config.bgGlass}
          border ${config.borderGlass}
          rounded-full
          backdrop-blur-md
          transition-all duration-200 ease-out
          hover:scale-105 hover:shadow-lg
          ${config.textColor}
          font-montserrat font-600
          ${sizeClass.fontSize}
          whitespace-nowrap
        `}
        style={{
          boxShadow: `0 4px 16px ${config.color}20`,
        }}
      >
        <IconComponent size={sizeClass.iconSize} strokeWidth={2} />
        <span>{config.text}</span>
      </div>
    );
  }
);

ShiftStatus.displayName = 'ShiftStatus';
