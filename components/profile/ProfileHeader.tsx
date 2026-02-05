'use client'

import { Star, Shield, User, Edit2 } from 'lucide-react'

interface ProfileHeaderProps {
  user: any
  onEdit: () => void
  profileType?: string // "Профиль шефа", "Профиль воркера", etc.
}

export default function ProfileHeader({ user, onEdit, profileType }: ProfileHeaderProps) {
  console.log('[ProfileHeader] ===== RENDERING =====')
  console.log('[ProfileHeader] user.avatar_url:', user.avatar_url)
  console.log('[ProfileHeader] Full user object:', user)

  return (
    <div
      className="relative rounded-2xl border border-white/10 p-6 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url(/images/profile-bg.png)' }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
        {/* Left: Avatar and profile type */}
        <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={`${user.avatar_url}?t=${Date.now()}`}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('[ProfileHeader] ✅ Avatar loaded successfully!')
                  }}
                  onError={(e) => {
                    console.error('[ProfileHeader] ❌ Avatar failed to load!')
                    console.error('[ProfileHeader] URL that failed:', user.avatar_url)
                    console.error('[ProfileHeader] Full src:', e.currentTarget.src)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>

            {/* Verification badge */}
            {user.gosuslugi_verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-2 border-[#2A2A2A] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Profile type below avatar */}
          {profileType && (
            <p className="text-xs text-gray-300 font-medium text-center sm:whitespace-nowrap">
              {profileType}
            </p>
          )}
        </div>

        {/* Center: Name and stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{user.full_name}</h2>
            {user.is_verified && (
              <Shield className="w-5 h-5 text-blue-400" />
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 text-sm mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-medium">{user.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">
              {user.total_shifts || 0} {user.total_shifts === 1 ? 'смена' : 'смен'}
            </span>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-gray-400 line-clamp-2">{user.bio}</p>
          )}
        </div>

        {/* Right: Contact info and Edit button wrapper */}
        <div className="flex items-start gap-2 w-full sm:w-auto">
          {/* Contact info */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Telegram</p>
              <p className="text-xs sm:text-sm text-white font-medium truncate">
                {user.telegram_id ? `@${user.telegram_id}` : user.email || 'Не указан'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Телефон</p>
              <p className="text-xs sm:text-sm text-white font-medium truncate">{user.phone || 'Не указан'}</p>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={onEdit}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex-shrink-0"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
