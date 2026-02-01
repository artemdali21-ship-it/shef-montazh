'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserRole } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const userRole = await getUserRole()

      // Redirect to role-specific dashboard
      if (userRole === 'shef') {
        router.replace('/shef/dashboard')
      } else if (userRole === 'client') {
        router.replace('/client/shifts')
      } else {
        router.replace('/worker/shifts')
      }
    }

    redirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Перенаправление...</p>
      </div>
    </div>
  )
}
