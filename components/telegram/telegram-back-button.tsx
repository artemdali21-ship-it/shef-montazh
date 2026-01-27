'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramApp } from '@/hooks/use-telegram-app'

interface TelegramBackButtonProps {
  onBack?: () => void
  isVisible?: boolean
}

export function TelegramBackButton({
  onBack,
  isVisible = true,
}: TelegramBackButtonProps) {
  const router = useRouter()
  const { webapp } = useTelegramApp()

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  useEffect(() => {
    if (!webapp?.BackButton) return

    const button = webapp.BackButton

    // Handle visibility
    if (isVisible) {
      button.show()
    } else {
      button.hide()
    }

    // Add click handler
    const handleClick = () => {
      handleBack()
    }

    button.onClick(handleClick)

    return () => {
      button.offClick(handleClick)
    }
  }, [webapp, isVisible, handleBack])

  return null
}
