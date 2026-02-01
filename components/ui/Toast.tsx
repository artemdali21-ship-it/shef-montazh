'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      iconColor: 'text-blue-400'
    }
  }

  const { icon: Icon, bg, border, text, iconColor } = config[type]

  return (
    <div
      className={`
        ${bg} backdrop-blur-xl border ${border} rounded-xl
        shadow-lg p-4 flex items-center gap-3
        animate-slide-in-right
      `}
    >
      <Icon size={20} className={iconColor} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/10 rounded-lg p-1 transition"
      >
        <X size={18} className="text-gray-400" />
      </button>
    </div>
  )
}
