'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}: AnimatedButtonProps) {
  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-sm',
    outline: 'bg-transparent hover:bg-white/5 text-white border border-white/20',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
  }

  const sizeClasses = {
    sm: 'h-11 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  }

  return (
    <motion.button
      className={cn(
        'rounded-xl font-bold transition-all flex items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  )
}
