import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const CustomButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-inter font-bold rounded-xl transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-95 flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-[#E85D2F] hover:bg-[#D94D1F] text-white disabled:bg-[#E85D2F]/50 shadow-md',
    secondary: 'bg-[#BFFF00] hover:bg-[#AAEE00] text-black disabled:bg-[#BFFF00]/50 shadow-md',
    outline:
      'bg-transparent border-2 border-white/10 hover:border-[#E85D2F]/50 text-white disabled:opacity-50',
    ghost: 'bg-white/5 hover:bg-white/10 text-white disabled:opacity-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/50 shadow-md',
  }

  const sizes = {
    sm: 'h-11 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}
