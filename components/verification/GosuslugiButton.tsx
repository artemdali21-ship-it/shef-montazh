'use client'

import { ShieldCheck, CheckCircle2 } from 'lucide-react'

interface GosuslugiButtonProps {
  isVerified: boolean
  onVerify: () => void
  compact?: boolean
}

export function GosuslugiButton({ isVerified, onVerify, compact = false }: GosuslugiButtonProps) {
  if (isVerified) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
          <CheckCircle2 size={16} className="text-green-400" />
          <span className="text-xs font-600 text-green-400">Верифицирован</span>
        </div>
      )
    }

    return (
      <div className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-green-500/20 border border-green-500/50 backdrop-blur-xl">
        <CheckCircle2 size={24} className="text-green-400" />
        <span className="text-lg font-700 text-green-400">Верифицирован через Госуслуги</span>
      </div>
    )
  }

  return (
    <button
      onClick={onVerify}
      className={`
        w-full group relative overflow-hidden rounded-2xl
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
      `}
      style={{
        background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)',
      }}
    >
      {/* Glassmorphism backdrop effect */}
      <div className="absolute inset-0 backdrop-blur-xl opacity-80" />

      {/* Border effect */}
      <div className="absolute inset-0 border border-blue-400/40" style={{ borderRadius: '16px' }} />

      {/* Hover brightness overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white" />

      {/* Content */}
      <div
        className={`
          relative flex items-center justify-center gap-3
          font-700 text-white transition-all duration-300
          ${compact ? 'px-4 py-2 text-sm' : 'px-6 py-4 text-lg'}
        `}
      >
        <ShieldCheck
          size={compact ? 18 : 24}
          className="transition-transform group-hover:scale-110"
        />
        <span>Подтвердить через Госуслуги</span>
      </div>

      {/* Ripple effect on hover */}
      <style>{`
        @keyframes ripple {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0.8;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}

// Badge variant for compact display (e.g., in search results)
export function GosuslugiVerificationBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) return null

  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-green-500/30 to-green-400/20 border border-green-500/50 backdrop-blur-md">
      <CheckCircle2 size={14} className="text-green-400" />
      <span className="text-xs font-600 text-green-400">Верифицирован</span>
    </div>
  )
}
