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
    loadSession()
  }, [tg])

  const loadSession = async () => {
    try {
      setLoading(true)

      const telegramId = tg?.user?.id
      if (!telegramId) {
        console.log('[Session] No Telegram ID available')
        setSession(null)
        setLoading(false)
        return
      }

      console.log('[Session] Loading session for Telegram ID:', telegramId)

      // Step 1: Check CloudStorage first
      const storageSession = await getSessionFromStorage()

      if (storageSession && !isSessionExpired(storageSession)) {
        console.log('[Session] Valid session found in CloudStorage:', storageSession)
        setSession(storageSession)
        setLoading(false)
        return
      }

      // Step 2: Session expired or not found - check database
      console.log('[Session] No valid session in CloudStorage, checking database...')
      const dbUser = await fetchUserByTelegramId(telegramId)

      if (dbUser) {
        console.log('[Session] User found in database:', dbUser)

        // Create new session
        const newSession: Session = {
          userId: dbUser.id,
          telegramId: telegramId,
          role: dbUser.role as UserRole,
          hasSeenOnboarding: dbUser.has_completed_onboarding || false,
          expiresAt: Date.now() + SESSION_DURATION,
        }

        // Save to CloudStorage
        await saveSessionToStorage(newSession)
        setSession(newSession)
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
    const response = await fetch('/api/auth/user-by-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId }),
    })

    if (!response.ok) {
      console.error('[Session] Failed to fetch user:', response.statusText)
      return null
    }

    const data = await response.json()

    if (data.exists) {
      return {
        id: data.id,
        role: data.role,
        has_completed_onboarding: data.hasSeenOnboarding,
      }
    }

    return null
  } catch (error) {
    console.error('[Session] Error fetching user by telegram ID:', error)
    return null
  }
}
