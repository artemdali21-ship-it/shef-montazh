'use client';
import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';

export type PaymentStatusType = 'pending' | 'paid' | 'overdue';

export interface PaymentStatusProps {
  status: PaymentStatusType;
  dueDate?: Date;
  paidDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  pending: {
    color: '#E85D2F',
    icon: Clock,
    text: 'Ожидает оплаты',
    bgGlass: 'bg-orange-500/20',
    borderGlass: 'border-orange-500/30',
    textColor: 'text-orange-300',
    pulse: false,
  },
  paid: {
    color: '#10B981',
    icon: CheckCircle,
    text: 'Оплачено',
    bgGlass: 'bg-emerald-500/20',
    borderGlass: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    pulse: false,
  },
  overdue: {
    color: '#DC2626',
    icon: AlertCircle,
    text: 'Просрочено',
    bgGlass: 'bg-red-500/20',
    borderGlass: 'border-red-500/30',
    textColor: 'text-red-300',
    pulse: true,
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2.5 py-1.5',
    iconSize: 14,
    fontSize: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    padding: 'px-4 py-2',
    iconSize: 16,
    fontSize: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    padding: 'px-5 py-2.5',
    iconSize: 18,
    fontSize: 'text-base',
    gap: 'gap-2.5',
  },
};

export const PaymentStatus: React.FC<PaymentStatusProps> = React.memo(
  ({ status, dueDate, paidDate, size = 'md', className = '' }) => {
    const config = statusConfig[status];
    const sizeClass = sizeConfig[size];
    const IconComponent = config.icon;

    // Format date based on status
    let dateText = '';
    if (status === 'pending' && dueDate) {
      dateText = `до ${format(dueDate, 'd MMM', { locale: ru })}`;
    } else if (status === 'paid' && paidDate) {
      dateText = format(paidDate, 'd MMM', { locale: ru });
    } else if (status === 'overdue' && dueDate) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      dateText = `на ${daysOverdue} ${daysOverdue === 1 ? 'день' : 'дня'}`;
    }

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
          ${config.pulse && status === 'overdue' ? 'animate-pulse' : ''}
          ${className}
        `}
        style={{
          boxShadow: `0 4px 16px ${config.color}20`,
        }}
        role="status"
        aria-label={`Статус платежа: ${config.text}${dateText ? '. ' + dateText : ''}`}
      >
        <IconComponent size={sizeClass.iconSize} strokeWidth={2} />
        <span>{config.text}</span>
        {dateText && <span className="opacity-80">({dateText})</span>}
      </div>
    );
  }
);

PaymentStatus.displayName = 'PaymentStatus';
