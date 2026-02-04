'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CreateShiftScreen from '@/components/CreateShiftScreen'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function CreateShiftPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()

  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        // Not logged in - redirect to home
        router.push('/')
        return
      }

      // Workers can't create shifts
      if (session.role === 'worker') {
        router.push('/worker/shifts')
        return
      }

      // Only client and shef can create shifts
      if (session.role !== 'client' && session.role !== 'shef') {
        router.push('/')
      }
    }
  }, [sessionLoading, session, router])

  // Show loading while session is loading
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Don't render until we have a valid session
  if (!session || (session.role !== 'client' && session.role !== 'shef')) {
    return null
  }

  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <CreateShiftScreen />
    </div>
  )
}
