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
  // Base styles with all 5 states per design guide
  const baseStyles =
    'font-inter font-600 rounded-lg transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center gap-2 min-h-[44px]'

  const variants = {
    primary: `
      bg-primary hover:bg-primary/90 active:bg-primary/80 
      text-primary-foreground
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      shadow-sm hover:shadow-md active:shadow-sm
      hover:translate-y-[-1px] active:scale-95
    `,
    secondary: `
      bg-secondary hover:bg-secondary/90 active:bg-secondary/80
      text-secondary-foreground
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      shadow-sm hover:shadow-md active:shadow-sm
      hover:translate-y-[-1px] active:scale-95
    `,
    outline: `
      bg-transparent border border-border
      text-foreground hover:text-primary hover:border-primary
      active:bg-primary/5
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      hover:translate-y-[-1px] active:scale-95
    `,
    ghost: `
      bg-transparent hover:bg-white/5 active:bg-white/10
      text-foreground
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      hover:translate-y-[-1px] active:scale-95
    `,
    danger: `
      bg-destructive hover:bg-destructive/90 active:bg-destructive/80
      text-destructive-foreground
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      shadow-sm hover:shadow-md active:shadow-sm
      hover:translate-y-[-1px] active:scale-95
    `,
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
