'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import RoleSelector from '@/components/auth/RoleSelector'
import InitialOnboarding from '@/components/onboarding/InitialOnboarding'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Проверяем session только после завершения onboarding
  useEffect(() => {
    // Если onboarding еще не завершен - ничего не делаем
    if (!onboardingComplete) return

    // Если session еще загружается - ждем
    if (sessionLoading) return

    // Onboarding завершен и session загружена
    if (session) {
      console.log('[HomePage] Session found after onboarding:', session)
      setIsRedirecting(true)

      // МУЛЬТИРОЛЬ ЛОГИКА:
      // Если у пользователя несколько ролей но нет активной - показать role-picker
      if (!session.role && session.roles && session.roles.length > 1) {
        console.log('[HomePage] User has multiple roles, redirecting to role-picker')
        router.push('/role-picker')
        return
      }

      // User is logged in - redirect to dashboard directly
      const dashboardPaths = {
        worker: '/worker/shifts',
        client: '/client/shifts',
        shef: '/shef/dashboard',
      }

      const path = dashboardPaths[session.role]
      console.log('[HomePage] Redirecting to:', path)
      router.push(path)
    }
    // Если session нет - просто показываем RoleSelector (ниже)
  }, [onboardingComplete, sessionLoading, session, router])

  const handleOnboardingComplete = () => {
    console.log('[HomePage] Initial onboarding complete')
    setOnboardingComplete(true)
  }

  // Сразу показываем onboarding (session грузится параллельно в фоне)
  if (!onboardingComplete) {
    return <InitialOnboarding onComplete={handleOnboardingComplete} />
  }

  // Onboarding завершен, но session еще загружается или происходит редирект
  if (sessionLoading || isRedirecting) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center z-50"
        style={{
          opacity: 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <div className="text-center">
          <div className="mb-6 opacity-90">
            <Logo size="lg" showText={true} />
          </div>
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // Onboarding завершен, session загружена (или нет) - показываем RoleSelector
  return <RoleSelector />
}
