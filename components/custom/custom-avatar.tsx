import React from 'react'
import { User } from 'lucide-react'

interface CustomAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  online,
  className = '',
}) => {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }

  const onlineDotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full overflow-hidden
          bg-gradient-to-br from-[#E85D2F] to-[#D94D1F]
          flex items-center justify-center
        `}
      >
        {src ? (
          <img src={src || "/placeholder.svg"} alt={alt} className="w-full h-full object-cover" />
        ) : fallback ? (
          <span className="font-montserrat font-800 text-white">{fallback}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>

      {online !== undefined && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-[#2A2A2A]
            ${onlineDotSizes[size]}
            ${online ? 'bg-[#BFFF00]' : 'bg-[#6B6B6B]'}
          `}
        />
      )}
    </div>
  )
}
