'use client'

import { useEffect, useState } from 'react'
import { useTelegram } from '@/lib/telegram'

interface TelegramGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function TelegramGuard({ children, fallback }: TelegramGuardProps) {
  const tg = useTelegram()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for Telegram to be ready
    if (typeof window !== 'undefined') {
      const checkTelegram = () => {
        const hasWebApp = !!(window as any).Telegram?.WebApp
        const hasUserId = hasWebApp && (window as any).Telegram.WebApp.initDataUnsafe?.user?.id

        if (hasWebApp && hasUserId) {
          console.log('[TelegramGuard] ✅ Telegram Mini App detected')
          setIsReady(true)
        } else {
          console.log('[TelegramGuard] ❌ Not in Telegram Mini App')
          setIsReady(true) // Still mark ready so fallback shows
        }
      }

      // Check immediately
      checkTelegram()

      // Also check after a short delay in case Telegram loads late
      const timer = setTimeout(checkTelegram, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!tg?.user?.id) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">⛔ Только Telegram</h1>
            <p className="text-gray-400">
              Это приложение работает только в Telegram Mini App. Откройте его через Telegram.
            </p>
          </div>
          <button
            onClick={() => {
              // Try to open in Telegram if possible
              const url = window.location.href
              window.location.href = `tg://resolve?domain=YourBotUsername&start=open_app`
            }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
          >
            Открыть в Telegram
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
