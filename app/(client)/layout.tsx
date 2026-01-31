'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import BotActivationBanner from '@/components/notifications/BotActivationBanner'

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
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      <BotActivationBanner />
      {children}
      <BottomNav userType="client" userId={userId} />
    </div>
  )
}
