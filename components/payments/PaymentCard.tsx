'use client'

import { Payment } from '@/lib/api/payments'
import PaymentStatusBadge from './PaymentStatusBadge'
import { Calendar, DollarSign } from 'lucide-react'
import Image from 'next/image'

interface PaymentCardProps {
  payment: Payment
  role: 'worker' | 'client'
  onClick?: () => void
}

export default function PaymentCard({ payment, role, onClick }: PaymentCardProps) {
  const shift = payment.shift
  const person = role === 'worker' ? payment.client : payment.worker

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽'
  }

  return (
    <div
      onClick={onClick}
      className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {person?.avatar_url ? (
            <Image
              src={person.avatar_url}
              alt={person.full_name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {person?.full_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Shift Title */}
          <h3 className="text-base font-bold text-white mb-1 truncate">
            {shift?.title || 'Смена'}
          </h3>

          {/* Person Name */}
          {person && (
            <p className="text-sm text-gray-400 mb-3">
              {person.full_name}
            </p>
          )}

          {/* Amount & Status Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold text-xl">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            <PaymentStatusBadge status={payment.status} size="sm" />
          </div>

          {/* Platform Fee */}
          {payment.platform_fee > 0 && (
            <div className="text-xs text-gray-500 mb-2">
              Комиссия: {formatCurrency(payment.platform_fee)}
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {payment.paid_at
                ? `Оплачено ${formatDate(payment.paid_at)}`
                : `Создано ${formatDate(payment.created_at)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
