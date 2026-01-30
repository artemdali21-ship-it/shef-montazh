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
    elevated: 'bg-white/5 border border-white/10 shadow-xl',
    bordered: 'bg-transparent border-2 border-white/10',
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const clickableStyles = onClick
    ? 'cursor-pointer hover:border-[#E85D2F]/50 transition-all active:scale-[0.98]'
    : ''

  return (
    <div
      className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
