import React, { forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  helperText?: string
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, icon: Icon, iconPosition = 'left', helperText, className = '', ...props }, ref) => {
    const hasIcon = !!Icon
    const paddingStyle = hasIcon ? (iconPosition === 'left' ? 'pl-12 pr-4' : 'pl-4 pr-12') : 'px-4'

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
          )}

          <input
            ref={ref}
            className={`
              w-full h-14 bg-white/5 border rounded-xl
              text-white font-montserrat font-500
              focus:outline-none transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${paddingStyle}
              ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'}
              ${className}
            `}
            {...props}
          />

          {Icon && iconPosition === 'right' && (
            <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
          )}
        </div>

        {error && <p className="text-xs text-red-500 font-montserrat font-500 mt-1 px-1">{error}</p>}

        {helperText && !error && (
          <p className="text-xs text-[#6B6B6B] font-montserrat font-500 mt-1 px-1">{helperText}</p>
        )}
      </div>
    )
  },
)

CustomInput.displayName = 'CustomInput'
