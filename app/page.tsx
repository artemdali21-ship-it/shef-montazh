'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import RoleSelector from '@/components/auth/RoleSelector'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  const router = useRouter()
  const { session, loading } = useTelegramSession()

  useEffect(() => {
    if (loading) return

    if (session) {
      console.log('[HomePage] Session found:', session)

      // User is logged in - check if onboarding is complete
      if (session.hasSeenOnboarding) {
        // Redirect to role-specific dashboard
        const dashboardPaths = {
          worker: '/worker/shifts',
          client: '/client/shifts',
          shef: '/shef/dashboard',
        }

        const path = dashboardPaths[session.role]
        console.log('[HomePage] Redirecting to:', path)
        router.push(path)
      } else {
        // Redirect to onboarding
        const onboardingPath = `/onboarding/${session.role}`
        console.log('[HomePage] Redirecting to onboarding:', onboardingPath)
        router.push(onboardingPath)
      }
    } else {
      console.log('[HomePage] No session - showing role selector')
    }
  }, [session, loading, router])

  // Show loading while checking session
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Show role selector if no session
  if (!session) {
    return <RoleSelector />
  }

  // Show nothing while redirecting
  return null
}
