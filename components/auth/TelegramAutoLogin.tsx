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
    const skipPages = ['/auth/login', '/auth/register', '/auth/welcome']
    if (skipPages.some(page => pathname?.startsWith(page))) {
      setIsChecking(false)
      return
    }

    checkTelegramAuth()
  }, [pathname])

  const checkTelegramAuth = async () => {
    try {
      // Check if already authenticated via Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsChecking(false)
        return
      }

      // Get Telegram user data
      if (!tg?.user?.id) {
        console.log('[TelegramAutoLogin] No Telegram user data, skipping auto-login')
        setIsChecking(false)
        return
      }

      const telegramId = tg.user.id
      console.log('[TelegramAutoLogin] Checking for user with telegram_id:', telegramId)

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single()

      if (existingUser) {
        console.log('[TelegramAutoLogin] User found, auto-logging in...')

        // Create a magic link session or custom auth
        // For now, we'll use email auth with a placeholder
        const email = `${telegramId}@telegram.user`

        // Try to sign in (user should already exist in auth.users)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: `telegram_${telegramId}_autologin`
        })

        if (signInError) {
          console.error('[TelegramAutoLogin] Sign-in error:', signInError)
          // If sign-in fails, redirect to login
          router.push('/auth/welcome')
        } else {
          console.log('[TelegramAutoLogin] Auto-login successful')

          // Redirect based on role
          switch (existingUser.role) {
            case 'worker':
              router.push('/worker/shifts')
              break
            case 'client':
              router.push('/client/shifts')
              break
            case 'shef':
              router.push('/shef/dashboard')
              break
            case 'admin':
              router.push('/admin')
              break
            default:
              router.push('/role-select')
          }
        }
      } else {
        console.log('[TelegramAutoLogin] User not found, redirecting to welcome')
        // User doesn't exist, redirect to welcome/registration
        router.push('/auth/welcome')
      }
    } catch (error) {
      console.error('[TelegramAutoLogin] Error:', error)
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
