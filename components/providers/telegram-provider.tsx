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
        setTimeout(initTelegram, 100)
        return
      }

      console.log('[Telegram WebApp] Initializing...')

      // CRITICAL: Ready the app (removes "Layout OK" button)
      webapp.ready()

      // Expand to fullscreen
      webapp.expand()

      console.log('[Telegram WebApp] Ready and expanded')

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
