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
    default: 'bg-white/10 text-white border border-white/10',
    success: 'bg-[#BFFF00]/20 text-[#BFFF00] border border-[#BFFF00]/30',
    warning: 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-[#E85D2F]/20 text-[#E85D2F] border border-[#E85D2F]/30',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs min-h-[20px]',
    md: 'px-3 py-1.5 text-sm min-h-[24px]',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-inter font-bold uppercase
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
