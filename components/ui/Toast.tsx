'use client'

import { CheckCircle, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

export default function Toast({
  type = 'success',
  message,
  onClose
}: {
  type?: 'success' | 'error'
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const Icon = type === 'success' ? CheckCircle : XCircle
  const bgColor = type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
  const textColor = type === 'success' ? 'text-green-400' : 'text-red-400'
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400'
  const borderColor = type === 'success' ? 'border-green-500/30' : 'border-red-500/30'

  return (
    <div className={`fixed bottom-24 left-4 right-4 ${bgColor} border ${borderColor} backdrop-blur-xl p-4 rounded-xl shadow-lg animate-slide-up z-50 max-w-screen-md mx-auto`}>
      <div className="flex items-start gap-3">
        <Icon className={`${iconColor} flex-shrink-0 animate-success`} size={24} />
        <p className={`${textColor} flex-1 font-medium`}>{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300 transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
