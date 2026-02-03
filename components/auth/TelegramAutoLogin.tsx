'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTelegram } from '@/lib/telegram'

/**
 * TelegramAutoLogin Component
 *
 * Automatically authenticates user via Telegram ID on app load
 * - Checks if user exists in database by telegram_id
 * - If exists and profile completed: auto-login and redirect to dashboard
 * - If exists but profile not completed: redirect to profile completion
 * - If doesn't exist: redirect to registration
 */
export default function TelegramAutoLogin() {
  const router = useRouter()
  const pathname = usePathname()
  const tg = useTelegram()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip auto-login on certain pages to avoid loops
    const skipPages = [
      '/',
      '/auth/register',
      '/onboarding',
      '/auth/complete-profile',
      '/auth/welcome',
      '/role-select',
      '/role-picker',
      '/settings/add-role',
    ]

    if (skipPages.some(page => pathname?.startsWith(page))) {
      console.log('[TelegramAutoLogin] Skipping on page:', pathname)
      setIsChecking(false)
      return
    }

    console.log('[TelegramAutoLogin] Running auto-login check on page:', pathname)
    checkTelegramAuth()
  }, [pathname, router])

  const checkTelegramAuth = async () => {
    try {
      console.log('[TelegramAutoLogin] Starting auth check...')

      // Check if already authenticated via /api/auth/me
      const response = await fetch('/api/auth/me')

      if (response.ok) {
        const data = await response.json()
        const user = data.user

        console.log('[TelegramAutoLogin] User authenticated:', user.id)

        // User is authenticated
        if (!user.roles || user.roles.length === 0) {
          console.log('[TelegramAutoLogin] No roles found, redirecting to role-select')
          router.push('/role-select')
          return
        }

        // If multiple roles, show role picker
        if (user.roles.length > 1) {
          console.log('[TelegramAutoLogin] Multiple roles, showing role picker')
          router.push(`/role-picker?telegramId=${user.telegram_id}`)
          return
        }

        // Single role - redirect to dashboard
        const role = user.current_role || user.roles[0]
        const dashboardPaths: Record<string, string> = {
          worker: '/worker/shifts',
          client: '/client/shifts',
          shef: '/shef/dashboard',
        }

        console.log('[TelegramAutoLogin] Authenticated with role:', role)
        router.push(dashboardPaths[role] || '/worker/shifts')
        return
      }

      // Not authenticated - check if Telegram ID available
      const telegramId = tg?.user?.id

      if (!telegramId) {
        console.log('[TelegramAutoLogin] No Telegram ID, redirecting to welcome')
        router.push('/auth/welcome')
        setIsChecking(false)
        return
      }

      console.log('[TelegramAutoLogin] Not authenticated, redirecting to welcome')
      router.push('/auth/welcome')
    } catch (error) {
      console.error('[TelegramAutoLogin] Error:', error)
      router.push('/auth/welcome')
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  return null
}
