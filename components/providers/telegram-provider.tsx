'use client'

import { useEffect, ReactNode } from 'react'

interface TelegramProvider {
  children: ReactNode
}

export default function TelegramProvider({ children }: TelegramProvider) {
  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webapp = (window as any).Telegram.WebApp
      
      // Ready the app
      webapp.ready()
      
      // Expand to fullscreen
      webapp.expand()
      
      // Set header color
      webapp.setHeaderColor('#2A2A2A')
      webapp.setBackgroundColor('#1A1A1A')
      
      // Enable closing confirmation
      webapp.enableClosingConfirmation()
      
      // Set up platform-specific styling
      if (webapp.platform === 'ios') {
        document.documentElement.style.setProperty('--twa-bottom-safe-area', `${webapp.bottomSafeAreaInset}px`)
      }
      
      // Prevent double tap zoom
      document.addEventListener('touchmove', (e) => {
        if ((e.target as any).closest('[data-allow-scroll]')) return
        e.preventDefault()
      }, { passive: false })
    }
  }, [])

  return (
    <div className="w-full text-white" style={{
      minHeight: 'var(--app-height, 100vh)',
      paddingBottom: 'var(--twa-bottom-safe-area, 0px)',
      backgroundColor: '#1A1A1A',
    }}>
      {children}
    </div>
  )
}
