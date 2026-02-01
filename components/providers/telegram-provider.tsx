'use client'

import { useEffect, ReactNode } from 'react'

interface TelegramProvider {
  children: ReactNode
}

export default function TelegramProvider({ children }: TelegramProvider) {
  useEffect(() => {
    // Wait for Telegram WebApp script to be fully loaded
    const initTelegram = () => {
      if (typeof window === 'undefined') return

      const webapp = (window as any).Telegram?.WebApp
      if (!webapp) {
        // Script not loaded yet, wait a bit and try again
        setTimeout(initTelegram, 50)
        return
      }

      console.log('[Telegram WebApp] Initializing...', {
        version: webapp.version,
        platform: webapp.platform,
        isExpanded: webapp.isExpanded
      })

      // CRITICAL: Ready the app FIRST (removes "Layout OK" button)
      webapp.ready()

      // Small delay to ensure ready() is processed
      setTimeout(() => {
        // Expand to fullscreen
        webapp.expand()
        console.log('[Telegram WebApp] Ready and expanded')
      }, 10)

      // Set header color
      webapp.setHeaderColor('#2A2A2A')
      webapp.setBackgroundColor('#1A1A1A')

      // Enable closing confirmation
      webapp.enableClosingConfirmation()

      // Set up platform-specific styling
      if (webapp.platform === 'ios') {
        document.documentElement.style.setProperty('--twa-bottom-safe-area', `${webapp.bottomSafeAreaInset}px`)
      }

      console.log('[Telegram WebApp] Platform:', webapp.platform, 'Version:', webapp.version)
    }

    // Start initialization immediately
    initTelegram()
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white" style={{
      paddingBottom: 'var(--twa-bottom-safe-area, 0px)',
    }}>
      {children}
    </div>
  )
}
