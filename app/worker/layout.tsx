'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import BotActivationBanner from '@/components/notifications/BotActivationBanner'
import { FloatingObjects } from '@/components/FloatingObjects'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading: sessionLoading } = useTelegramSession()
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!sessionLoading && session) {
      console.log('[WorkerLayout] Session loaded, userId:', session.userId)
      setUserId(session.userId)
    }
  }, [sessionLoading, session])

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <FloatingObjects />
      <BotActivationBanner />
      {children}
      <BottomNav userType="worker" userId={userId} />
      {/* DEBUG: Layout is loaded */}
      <div className="fixed top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs z-50">
        Layout OK
      </div>
    </div>
  )
}
