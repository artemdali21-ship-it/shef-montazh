'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import RoleSelector from '@/components/auth/RoleSelector'
import InitialOnboarding from '@/components/onboarding/InitialOnboarding'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  const router = useRouter()
  const { session, loading } = useTelegramSession()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

  useEffect(() => {
    if (loading) return

    if (session) {
      console.log('[HomePage] Session found:', session)

      // User is logged in - redirect to dashboard
      if (session.hasSeenOnboarding) {
        const dashboardPaths = {
          worker: '/worker/shifts',
          client: '/client/shifts',
          shef: '/shef/dashboard',
        }

        const path = dashboardPaths[session.role]
        console.log('[HomePage] Redirecting to:', path)
        router.push(path)
      } else {
        // Onboarding not complete - redirect to onboarding
        const onboardingPath = `/onboarding/${session.role}`
        console.log('[HomePage] Redirecting to onboarding:', onboardingPath)
        router.push(onboardingPath)
      }
    } else {
      // No session - show initial onboarding slides
      console.log('[HomePage] No session - showing initial onboarding')
      setShowOnboarding(true)
    }
  }, [session, loading, router])

  const handleOnboardingComplete = () => {
    console.log('[HomePage] Initial onboarding complete - showing role selector')
    setShowOnboarding(false)
    setShowRoleSelector(true)
  }

  // Show loading while checking session
  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center z-50"
        style={{
          opacity: 1,
          transition: 'opacity 0.3s ease-in-out',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div className="text-center">
          <div className="mb-6" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <Logo size="lg" showText={true} />
          </div>
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium opacity-70">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Show initial onboarding (3 slides with helmets)
  if (showOnboarding) {
    return <InitialOnboarding onComplete={handleOnboardingComplete} />
  }

  // Show role selector after onboarding
  if (showRoleSelector) {
    return <RoleSelector />
  }

  // Show nothing while redirecting
  return null
}
