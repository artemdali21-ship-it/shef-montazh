'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
    }
    getUser()
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col overflow-hidden">
      {/* CONTENT */}
      <div className="flex-1 overflow-y-scroll pb-24 w-full" data-allow-scroll>
        {children}
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav userType="client" userId={userId} />
    </div>
  )
}
