import React, { forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  helperText?: string
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, success, icon: Icon, iconPosition = 'left', helperText, className = '', ...props }, ref) => {
    const hasIcon = !!Icon
    const paddingStyle = hasIcon ? (iconPosition === 'left' ? 'pl-12 pr-4' : 'pl-4 pr-12') : 'px-4'

    const getBorderColor = () => {
      if (error) return 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
      if (success) return 'border-[#BFFF00] focus:border-[#BFFF00] focus:shadow-[0_0_0_2px_rgba(191,255,0,0.2)]'
      return 'border-white/10 focus:border-[#E85D2F] focus:shadow-[0_0_0_2px_rgba(232,93,47,0.2)]'
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-inter font-normal text-white mb-2 px-1">
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" aria-hidden="true" />
          )}

          <input
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            className={`
              w-full h-14 bg-white/5 border rounded-xl
              text-white font-inter font-normal
              focus:outline-none transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${paddingStyle}
              ${getBorderColor()}
              ${className}
            `}
            {...props}
          />

          {Icon && iconPosition === 'right' && (
            <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" aria-hidden="true" />
          )}
        </div>

        {error && (
          <p id={`${props.id}-error`} className="text-xs text-red-400 font-inter font-normal mt-2 px-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-xs text-[#6B6B6B] font-inter font-normal mt-2 px-1">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

CustomInput.displayName = 'CustomInput'
