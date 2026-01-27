'use client'

import { Star, MapPin } from 'lucide-react'
import { GosuslugiVerificationBadge } from './verification'

interface UserProfileCardProps {
  name: string
  specialization: string
  rating: number
  completedJobs: number
  location: string
  isGosuslugiVerified: boolean
  onClick?: () => void
}

export function UserProfileCard({
  name,
  specialization,
  rating,
  completedJobs,
  location,
  isGosuslugiVerified,
  onClick,
}: UserProfileCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 cursor-pointer transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Gosuslugi Verification Badge - Top Right */}
      <GosuslugiVerificationBadge isVerified={isGosuslugiVerified} />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-700 text-base truncate">{name}</h3>

          <p className="text-white/70 text-sm mb-2">{specialization}</p>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" fill="currentColor" />
              <span className="text-white font-600">{rating}</span>
            </div>
            <div className="text-white/60">
              {completedJobs} работ{completedJobs % 10 === 1 && completedJobs !== 11 ? 'а' : completedJobs % 10 === 2 || completedJobs % 10 === 3 || completedJobs % 10 === 4 ? '' : ''}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
            <MapPin size={12} />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
