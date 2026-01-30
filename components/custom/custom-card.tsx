'use client'

import React from 'react'

interface CustomCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}) => {
  const variants = {
    default: 'bg-white/5 border border-white/10',
    elevated: 'bg-white/5 border border-white/10',
    bordered: 'bg-transparent border-2 border-white/10',
  }

  const shadows = {
    default: '',
    elevated: 'shadow-[0_4px_8px_rgba(0,0,0,0.15)]',
    bordered: '',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-4',
    lg: 'p-6',
  }

  const clickableStyles = onClick
    ? 'cursor-pointer hover:border-[#E85D2F]/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.98]'
    : 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'

  return (
    <div
      className={`
        rounded-xl
        ${variants[variant]}
        ${shadows[variant]}
        ${paddings[padding]}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </div>
  )
}
