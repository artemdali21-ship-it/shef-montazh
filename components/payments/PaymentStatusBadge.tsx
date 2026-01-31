import { Clock, Check, AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { PaymentStatus } from '@/lib/api/payments'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  size?: 'sm' | 'md' | 'lg'
}

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Ожидает',
      icon: Clock,
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
    },
    paid: {
      label: 'Оплачено',
      icon: Check,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/30',
    },
    overdue: {
      label: 'Просрочено',
      icon: AlertCircle,
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
    },
    failed: {
      label: 'Не удалось',
      icon: XCircle,
      bgColor: 'bg-red-900/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-900/30',
    },
    refunded: {
      label: 'Возвращено',
      icon: RefreshCw,
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-500/30',
    },
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-4 h-4',
    },
  }

  const { label, icon: Icon, bgColor, textColor, borderColor } = config[status]
  const { container, icon } = sizeClasses[size]

  return (
    <div
      className={`
        inline-flex items-center justify-center
        ${bgColor} ${textColor} ${borderColor}
        border rounded-full font-semibold
        backdrop-blur-sm
        ${container}
      `}
    >
      <Icon className={icon} />
      <span>{label}</span>
    </div>
  )
}
