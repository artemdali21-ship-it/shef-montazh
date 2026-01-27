import React from 'react'

export type CustomBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface CustomBadgeProps {
  children: React.ReactNode
  variant?: CustomBadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-white/10 text-white',
    success: 'bg-[#BFFF00] text-black',
    warning: 'bg-[#FFD60A] text-black',
    danger: 'bg-red-500 text-white',
    info: 'bg-[#E85D2F] text-white',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-montserrat font-800 uppercase
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
