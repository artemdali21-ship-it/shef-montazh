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
      
      // Prevent double tap zoom - BUT ALLOW SCROLL
      document.addEventListener('touchmove', (e) => {
        // Allow scroll on elements with overflow-y-scroll or overflow-y-auto
        const target = e.target as any
        if (target.closest('[data-allow-scroll]') || 
            target.closest('.overflow-y-scroll') ||
            target.closest('.overflow-y-auto') ||
            target.closest('[style*="overflow-y"]')) {
          return
        }
        // Only prevent on non-scrollable elements
        e.preventDefault()
      }, { passive: false })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white" style={{
      paddingBottom: 'var(--twa-bottom-safe-area, 0px)',
    }}>
      {children}
    </div>
  )
}
