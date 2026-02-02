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
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return

    if (session) {
      console.log('[HomePage] Session found:', session)
      setIsRedirecting(true)

      // Add small delay for smooth transition
      setTimeout(() => {
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
      }, 300)
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

  // Show loading while checking session or redirecting
  if (loading || isRedirecting) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center z-50"
        style={{
          opacity: 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        <style>{`
          @keyframes smoothPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.98); }
          }
        `}</style>
        <div className="text-center">
          <div className="mb-6" style={{ animation: 'smoothPulse 2.5s ease-in-out infinite' }}>
            <Logo size="lg" showText={true} />
          </div>
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" style={{ animationDuration: '1s' }}></div>
          <p className="text-white text-lg font-medium opacity-70">
            {isRedirecting ? 'Входим...' : 'Загрузка...'}
          </p>
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
