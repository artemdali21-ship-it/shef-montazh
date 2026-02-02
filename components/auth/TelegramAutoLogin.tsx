'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
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
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const tg = useTelegram()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip auto-login on certain pages
    const skipPages = [
      '/',
      '/auth/register',
      '/onboarding',
      '/auth/complete-profile'
    ]

    // Important: We DON'T skip /auth/login and /auth/welcome so auto-login can work there
    if (skipPages.some(page => pathname?.startsWith(page))) {
      console.log('[TelegramAutoLogin] Skipping auto-login on page:', pathname)
      setIsChecking(false)
      return
    }

    console.log('[TelegramAutoLogin] Running auto-login check on page:', pathname)
    checkTelegramAuth()
  }, [pathname])

  const checkTelegramAuth = async () => {
    try {
      console.log('[TelegramAutoLogin] Starting auth check...')

      // First check if already authenticated via Supabase session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        console.log('[TelegramAutoLogin] ✅ Active session found')

        // Check if profile is completed
        const { data: userData } = await supabase
          .from('users')
          .select('profile_completed, current_role, roles')
          .eq('id', session.user.id)
          .single()

        if (userData && !userData.profile_completed) {
          console.log('[TelegramAutoLogin] Profile not completed, redirecting...')
          router.push('/auth/complete-profile')
          return
        }

        // Session valid and profile completed
        setIsChecking(false)
        return
      }

      // No active session, check Telegram ID
      const telegramId = tg?.user?.id

      if (!telegramId) {
        console.log('[TelegramAutoLogin] No Telegram ID available')
        router.push('/auth/welcome')
        setIsChecking(false)
        return
      }

      console.log('[TelegramAutoLogin] Checking for user with Telegram ID:', telegramId)

      // Check if user exists with this telegram_id (try both string and number)
      let existingUser = null
      let userError = null

      // Try as string first
      const result1 = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId.toString())
        .maybeSingle()

      if (result1.data) {
        existingUser = result1.data
        console.log('[TelegramAutoLogin] Found user with telegram_id (as string)')
      } else {
        // Try as number
        const result2 = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .maybeSingle()

        if (result2.data) {
          existingUser = result2.data
          console.log('[TelegramAutoLogin] Found user with telegram_id (as number)')
        } else {
          userError = result2.error
        }
      }

      if (userError || !existingUser) {
        console.log('[TelegramAutoLogin] User not found, redirecting to registration. Error:', userError)
        router.push('/auth/register')
        setIsChecking(false)
        return
      }

      console.log('[TelegramAutoLogin] User found:', existingUser.id)

      // Check if profile is completed
      if (!existingUser.profile_completed) {
        console.log('[TelegramAutoLogin] Profile not completed')

        // Sign in first, then redirect to profile completion
        await signInUserByTelegramId(existingUser)
        router.push('/auth/complete-profile')
        return
      }

      // User exists and profile completed - check if multiple roles
      console.log('[TelegramAutoLogin] User has roles:', existingUser.roles)

      // If multiple roles - show role picker
      if (existingUser.roles && existingUser.roles.length > 1) {
        console.log('[TelegramAutoLogin] Multiple roles found, redirecting to role-picker')
        await signInUserByTelegramId(existingUser)
        router.push(`/role-picker?telegramId=${existingUser.telegram_id}`)
        return
      }

      // Single role - auto sign in and redirect to dashboard
      console.log('[TelegramAutoLogin] Auto-signing in user...')
      await signInUserByTelegramId(existingUser)

      // Redirect based on current_role or first role
      const role = existingUser.current_role || existingUser.roles?.[0] || 'worker'
      console.log('[TelegramAutoLogin] Redirecting to dashboard for role:', role)

      switch (role) {
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
          router.push('/worker/shifts')
      }

    } catch (error) {
      console.error('[TelegramAutoLogin] Error:', error)
      router.push('/auth/welcome')
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * Sign in user using their Telegram ID
   * Creates a session using the user's email (telegram_id@telegram.user)
   */
  const signInUserByTelegramId = async (user: any) => {
    try {
      // Use Supabase admin auth to create session
      // Note: In production, this should be done via a secure API endpoint
      const email = `${user.telegram_id}@telegram.user`
      const password = `tg_${user.telegram_id}_${process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SECRET || 'secret'}`

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[TelegramAutoLogin] Sign in error:', error.message)
        // If password auth fails, try to sign up first (creates auth user)
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              telegram_id: user.telegram_id
            }
          }
        })
        // Then try to sign in again
        await supabase.auth.signInWithPassword({ email, password })
      }

      console.log('[TelegramAutoLogin] ✅ User signed in successfully')
    } catch (err) {
      console.error('[TelegramAutoLogin] Sign in failed:', err)
      throw err
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
