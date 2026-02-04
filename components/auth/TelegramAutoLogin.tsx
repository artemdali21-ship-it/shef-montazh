'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTelegram } from '@/lib/telegram'
import { createClient } from '@/lib/supabase-client'

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
  const supabase = createClient()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip auto-login on certain pages to avoid loops and allow manual navigation
    const skipPages = [
      '/auth/register',
      '/auth/login',
      '/auth/welcome',
      '/auth/complete-profile',
      '/onboarding',
      '/role-select',
      '/role-picker',
      '/settings',
      '/settings/add-role',
      // Dashboard pages - don't auto-check here, just show content
      '/worker',
      '/client', 
      '/shef',
      // Home page
      '/',
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

      // Step 1: Check if there's active Supabase session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        console.log('[TelegramAutoLogin] ✅ Active Supabase session found, user:', session.user.id)

        // Step 2: Check if API endpoint recognizes this session
        const apiResponse = await fetch('/api/auth/me')

        if (apiResponse.ok) {
          const data = await apiResponse.json()
          const user = data.user

          console.log('[TelegramAutoLogin] User authenticated via API:', user.id)

          // User is authenticated
          if (!user.roles || user.roles.length === 0) {
            console.log('[TelegramAutoLogin] No roles found, redirecting to role-select')
            router.push('/role-select')
            setIsChecking(false)
            return
          }

          // If multiple roles, show role picker
          if (user.roles.length > 1) {
            console.log('[TelegramAutoLogin] Multiple roles, showing role picker')
            router.push(`/role-picker?telegramId=${user.telegram_id}`)
            setIsChecking(false)
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
          setIsChecking(false)
          return
        } else {
          console.log('[TelegramAutoLogin] API rejected session, signing out and redirecting...')
          // Session exists but API doesn't recognize it - sign out and go to welcome
          await supabase.auth.signOut()
          router.push('/auth/welcome')
          setIsChecking(false)
          return
        }
      }

      // No active Supabase session - redirect to welcome
      console.log('[TelegramAutoLogin] No active session, redirecting to welcome')
      router.push('/auth/welcome')
      setIsChecking(false)
    } catch (error) {
      console.error('[TelegramAutoLogin] Error:', error)
      router.push('/auth/welcome')
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
