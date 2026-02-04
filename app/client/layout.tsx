'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import BotActivationBanner from '@/components/notifications/BotActivationBanner'
import { FloatingObjectsClient } from '@/components/FloatingObjectsClient'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading: sessionLoading } = useTelegramSession()
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!sessionLoading && session) {
      console.log('[ClientLayout] Session loaded, userId:', session.userId)
      setUserId(session.userId)
    }
  }, [sessionLoading, session])

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <FloatingObjectsClient />
      <BotActivationBanner />
      {children}
      <BottomNav userType="client" userId={userId} />
    </div>
  )
}
