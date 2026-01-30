'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'

export default function WorkerLayout({
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
      {children}
      <BottomNav userType="worker" userId={userId} />
      {/* DEBUG: Layout is loaded */}
      <div className="fixed top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs z-50">
        Layout OK
      </div>
    </div>
  )
}
