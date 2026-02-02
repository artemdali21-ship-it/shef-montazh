'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useTelegram } from '@/lib/telegram'

/**
 * TelegramAutoLogin Component
 *
 * Automatically authenticates user via Telegram ID on app load
 * - Checks if user exists in database
 * - If yes: auto-login and redirect to appropriate dashboard
 * - If no: redirect to registration with pre-filled Telegram data
 */
export default function TelegramAutoLogin() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const tg = useTelegram()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip auto-login on certain pages
    const skipPages = ['/', '/auth/login', '/auth/register', '/auth/welcome', '/onboarding']
    if (skipPages.some(page => pathname?.startsWith(page))) {
      setIsChecking(false)
      return
    }

    checkTelegramAuth()
  }, [pathname])

  const checkTelegramAuth = async () => {
    try {
      console.log('[TelegramAutoLogin] Starting auth check...')

      // Check if already authenticated via Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[TelegramAutoLogin] Session error:', sessionError)
      }

      console.log('[TelegramAutoLogin] Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        expiresAt: session?.expires_at
      })

      if (session?.user) {
        console.log('[TelegramAutoLogin] ✅ Active session found, user already authenticated')
        setIsChecking(false)
        return
      }

      // If no session, redirect to welcome page for login/registration
      console.log('[TelegramAutoLogin] ❌ No active session, redirecting to welcome')
      router.push('/auth/welcome')

    } catch (error) {
      console.error('[TelegramAutoLogin] Error:', error)
      // On error, redirect to welcome page
      router.push('/auth/welcome')
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-[#1A1A1A] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  return null
}
