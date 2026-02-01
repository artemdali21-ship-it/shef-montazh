'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import BotActivationBanner from '@/components/notifications/BotActivationBanner'
import { FloatingObjectsClient } from '@/components/FloatingObjectsClient'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <FloatingObjectsClient />
      <BotActivationBanner />
      {children}
      <BottomNav userType="client" userId={userId} />
    </div>
  )
}
