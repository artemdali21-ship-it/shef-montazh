'use client';

import React from 'react'

interface CustomToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { wrapper: 'w-10 h-6', toggle: 'w-4 h-4', translate: 'translate-x-5' },
    md: { wrapper: 'w-12 h-7', toggle: 'w-5 h-5', translate: 'translate-x-6' },
    lg: { wrapper: 'w-14 h-8', toggle: 'w-6 h-6', translate: 'translate-x-7' },
  }

  const currentSize = sizes[size]

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative rounded-full transition-colors
        ${currentSize.wrapper}
        ${enabled ? 'bg-[#BFFF00]' : 'bg-white/20'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          absolute top-1 bg-white rounded-full transition-transform
          ${currentSize.toggle}
          ${enabled ? currentSize.translate : 'translate-x-1'}
        `}
      />
    </button>
  )
}
