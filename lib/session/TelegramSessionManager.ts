'use client'

import { useState, useEffect } from 'react'
import { useTelegram } from '@/lib/telegram'
import type { Session, UserRole } from '@/types/session'

const SESSION_KEY = 'shef-montazh-session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export function useTelegramSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const tg = useTelegram()

  useEffect(() => {
    console.log('[DEBUG] useTelegramSession useEffect triggered')
    console.log('[DEBUG] tg ready:', !!tg)
    console.log('[DEBUG] tg?.user:', tg?.user)

    // Ждём готовности Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp

      console.log('[DEBUG] WebApp found:', !!webApp)
      console.log('[DEBUG] WebApp.initDataUnsafe:', webApp.initDataUnsafe)
      console.log('[DEBUG] WebApp.initDataUnsafe.user:', webApp.initDataUnsafe?.user)

      // Если уже готов и есть user ID
      if (webApp.initDataUnsafe?.user?.id) {
        console.log('[DEBUG] WebApp ready, loading session immediately')
        loadSession()
      } else {
        console.log('[DEBUG] WebApp not ready yet, waiting for ready event')
        // Ждём события ready
        const handleReady = () => {
          console.log('[DEBUG] WebApp ready event fired!')
          loadSession()
        }

        if (webApp.onEvent) {
          webApp.onEvent('viewportChanged', handleReady)
          // Также пробуем загрузить через таймаут как fallback
          setTimeout(() => {
            if (webApp.initDataUnsafe?.user?.id) {
              console.log('[DEBUG] WebApp ready after timeout')
              loadSession()
            } else {
              console.log('[DEBUG] No Telegram user after timeout')
              setLoading(false)
            }
          }, 1000)
        } else {
          // Fallback если onEvent не поддерживается
          setTimeout(loadSession, 500)
        }

        return () => {
          if (webApp.offEvent) {
            webApp.offEvent('viewportChanged', handleReady)
          }
        }
      }
    } else {
      console.log('[DEBUG] No Telegram WebApp available')
      setLoading(false)
    }
  }, [])

  const loadSession = async () => {
    try {
      setLoading(true)

      // Получаем Telegram ID из WebApp напрямую
      const webApp = (window as any).Telegram?.WebApp
      let telegramId = webApp?.initDataUnsafe?.user?.id

      // Dev mode fallback
      const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
      const mockTelegramId = process.env.NEXT_PUBLIC_MOCK_TELEGRAM_ID || '123456789'

      if (!telegramId && isDevMode) {
        console.log('[Session] No Telegram ID, using MOCK for dev mode:', mockTelegramId)
        telegramId = parseInt(mockTelegramId)
      }

      console.log('[Session] loadSession called')
      console.log('[Session] Telegram ID:', telegramId)
      console.log('[Session] Dev mode:', isDevMode)

      if (!telegramId) {
        console.log('[Session] No Telegram ID available')
        setSession(null)
        setLoading(false)
        return
      }

      // Step 1: Check CloudStorage first
      const storageSession = await getSessionFromStorage()
      console.log('[Session] CloudStorage session:', storageSession)

      if (storageSession && !isSessionExpired(storageSession)) {
        console.log('[Session] Valid session found in CloudStorage')
        console.log('[DEBUG] session:', storageSession)
        console.log('[DEBUG] hasSeenOnboarding:', storageSession.hasSeenOnboarding)
        setSession(storageSession)
        setLoading(false)
        return
      }

      // Step 2: Session expired or not found - check database
      console.log('[Session] No valid session in CloudStorage, checking database...')
      const dbUser = await fetchUserByTelegramId(telegramId)
      console.log('[Session] Database user:', dbUser)

      if (dbUser) {
        console.log('[Session] User found in database')
        console.log('[Session] has_completed_onboarding:', dbUser.has_completed_onboarding)
        console.log('[Session] current_role:', dbUser.role)
        console.log('[Session] roles array:', dbUser.roles)

        // КРИТИЧНО: Если пользователь не прошел onboarding - НЕ создаем сессию
        // Редирект на onboarding должен быть в роутере
        if (dbUser.has_completed_onboarding === false) {
          console.log('[Session] User has not seen onboarding, NOT creating session')
          setSession(null)
          setLoading(false)
          return
        }

        // Получаем массив ролей
        const userRoles = dbUser.roles || []
        const currentRole = dbUser.role

        // ЛОГИКА МУЛЬТИРОЛЬ:
        // 1. Если current_role установлен → автологин
        if (currentRole) {
          console.log('[Session] User has current_role, creating session')
          const newSession: Session = {
            userId: dbUser.id,
            telegramId: telegramId,
            role: currentRole as UserRole,
            roles: userRoles as UserRole[],
            hasSeenOnboarding: true,
            expiresAt: Date.now() + SESSION_DURATION,
          }
          await saveSessionToStorage(newSession)
          setSession(newSession)
          return
        }

        // 2. Если roles пустой (после logout) → онбординг/регистрация
        if (userRoles.length === 0) {
          console.log('[Session] User has no roles, need to register')
          setSession(null)
          setLoading(false)
          return
        }

        // 3. Если одна роль → автоустановить и залогинить
        if (userRoles.length === 1) {
          console.log('[Session] User has 1 role, auto-setting current_role')

          // Установить current_role в БД
          const singleRole = userRoles[0]
          try {
            const response = await fetch('/api/auth/switch-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: telegramId,
                newRole: singleRole,
              }),
            })

            if (response.ok) {
              const newSession: Session = {
                userId: dbUser.id,
                telegramId: telegramId,
                role: singleRole as UserRole,
                roles: userRoles as UserRole[],
                hasSeenOnboarding: true,
                expiresAt: Date.now() + SESSION_DURATION,
              }
              await saveSessionToStorage(newSession)
              setSession(newSession)
              return
            }
          } catch (error) {
            console.error('[Session] Error auto-setting role:', error)
          }
        }

        // 4. Если несколько ролей → НЕ создаем сессию (пользователь должен выбрать в role-picker)
        console.log('[Session] User has multiple roles, need to show role picker')
        setSession(null)
        setLoading(false)
        return
      } else {
        console.log('[Session] User not found in database')
        setSession(null)
      }
    } catch (error) {
      console.error('[Session] Error loading session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    await loadSession()
  }

  const clearSession = async () => {
    try {
      await clearSessionFromStorage()
      setSession(null)
    } catch (error) {
      console.error('[Session] Error clearing session:', error)
    }
  }

  return {
    session,
    loading,
    refreshSession,
    clearSession,
  }
}

// CloudStorage helpers
async function getSessionFromStorage(): Promise<Session | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.CloudStorage) {
        console.log('[Session] CloudStorage not available')
        resolve(null)
        return
      }

      const cloudStorage = (window as any).Telegram.WebApp.CloudStorage

      cloudStorage.getItem(SESSION_KEY, (error: any, value: string) => {
        if (error) {
          console.error('[Session] CloudStorage getItem error:', error)
          resolve(null)
          return
        }

        if (!value) {
          console.log('[Session] No session found in CloudStorage')
          resolve(null)
          return
        }

        try {
          const session = JSON.parse(value) as Session
          console.log('[Session] Session retrieved from CloudStorage:', session)
          resolve(session)
        } catch (parseError) {
          console.error('[Session] Error parsing session:', parseError)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('[Session] Error accessing CloudStorage:', error)
      resolve(null)
    }
  })
}

async function saveSessionToStorage(session: Session): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.CloudStorage) {
        console.log('[Session] CloudStorage not available for saving')
        resolve()
        return
      }

      const cloudStorage = (window as any).Telegram.WebApp.CloudStorage
      const sessionJson = JSON.stringify(session)

      cloudStorage.setItem(SESSION_KEY, sessionJson, (error: any, success: boolean) => {
        if (error) {
          console.error('[Session] CloudStorage setItem error:', error)
          reject(error)
          return
        }

        if (success) {
          console.log('[Session] Session saved to CloudStorage successfully')
          resolve()
        } else {
          console.error('[Session] Failed to save session to CloudStorage')
          reject(new Error('Failed to save session'))
        }
      })
    } catch (error) {
      console.error('[Session] Error saving to CloudStorage:', error)
      reject(error)
    }
  })
}

async function clearSessionFromStorage(): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.CloudStorage) {
        console.log('[Session] CloudStorage not available for clearing')
        resolve()
        return
      }

      const cloudStorage = (window as any).Telegram.WebApp.CloudStorage

      cloudStorage.removeItem(SESSION_KEY, (error: any, success: boolean) => {
        if (error) {
          console.error('[Session] CloudStorage removeItem error:', error)
        } else if (success) {
          console.log('[Session] Session cleared from CloudStorage')
        }
        resolve()
      })
    } catch (error) {
      console.error('[Session] Error clearing CloudStorage:', error)
      resolve()
    }
  })
}

function isSessionExpired(session: Session): boolean {
  const expired = Date.now() > session.expiresAt
  if (expired) {
    console.log('[Session] Session expired')
  }
  return expired
}

async function fetchUserByTelegramId(telegramId: number): Promise<any | null> {
  try {
    console.log('[Session] Fetching user by Telegram ID:', telegramId)
    const response = await fetch('/api/auth/user-by-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId }),
    })

    console.log('[Session] Fetch response status:', response.status)

    if (!response.ok) {
      console.error('[Session] Failed to fetch user:', response.statusText)
      return null
    }

    const data = await response.json()
    console.log('[Session] Fetch response data:', data)

    if (data.exists) {
      return {
        id: data.id,
        role: data.role, // This is current_role from API
        roles: data.roles || [], // Array of all user roles
        has_completed_onboarding: data.hasSeenOnboarding,
      }
    }

    return null
  } catch (error) {
    console.error('[Session] Error fetching user by telegram ID:', error)
    return null
  }
}
