'use client'

import { useEffect, useCallback } from 'react'
import { useTelegramApp } from '@/hooks/use-telegram-app'

interface TelegramMainButtonProps {
  text: string
  onClick: () => void
  isActive?: boolean
  isLoading?: boolean
  isVisible?: boolean
}

export function TelegramMainButton({
  text,
  onClick,
  isActive = true,
  isLoading = false,
  isVisible = true,
}: TelegramMainButtonProps) {
  const { webapp } = useTelegramApp()

  useEffect(() => {
    if (!webapp?.MainButton) return

    const button = webapp.MainButton

    // Set text
    button.setText(text)

    // Handle visibility
    if (isVisible) {
      button.show()
    } else {
      button.hide()
    }

    // Handle active state
    if (isActive && !isLoading) {
      button.enable()
    } else {
      button.disable()
    }

    // Handle loading state
    if (isLoading) {
      button.showProgress()
    } else {
      button.hideProgress()
    }

    // Set color
    button.setTextColor('#FFFFFF')

    // Add click handler
    const handleClick = () => {
      onClick()
    }

    button.onClick(handleClick)

    return () => {
      button.offClick(handleClick)
    }
  }, [webapp, text, onClick, isActive, isLoading, isVisible])

  return null
}
