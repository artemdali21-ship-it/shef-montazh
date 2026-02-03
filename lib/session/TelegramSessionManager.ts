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
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp

      // Если уже готов и есть user ID
      if (webApp.initDataUnsafe?.user?.id) {
        loadSession()
      } else {
        // Fallback: загружаем через таймаут
        setTimeout(() => {
          if (webApp.initDataUnsafe?.user?.id) {
            loadSession()
          } else {
            setLoading(false)
          }
        }, 1000)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const loadSession = async () => {
    try {
      setLoading(true)

      const webApp = (window as any).Telegram?.WebApp
      const telegramId = webApp?.initDataUnsafe?.user?.id

      if (!telegramId) {
        setSession(null)
        setLoading(false)
        return
      }

      // Step 1: Check CloudStorage
      const storageSession = await getSessionFromStorage()

      if (storageSession && !isSessionExpired(storageSession)) {
        console.log('[Session] ✅ Valid session found in CloudStorage')
        setSession(storageSession)
        setLoading(false)
        return
      }

      // Step 2: Session expired or not found - fetch from API
      console.log('[Session] Loading session from API...')
      const apiResponse = await fetch('/api/auth/me')
      
      if (apiResponse.ok) {
        const data = await apiResponse.json()
        const userRoles = data.user?.roles || []
        const currentRole = data.user?.current_role

        // Create new session with multi-role support
        const newSession: Session = {
          userId: data.user.id,
          telegramId: telegramId,
          role: currentRole || (userRoles[0] as UserRole) || 'worker',
          roles: userRoles,
          hasSeenOnboarding: true,
          expiresAt: Date.now() + SESSION_DURATION,
        }

        console.log('[Session] ✅ Created new session:', newSession)
        await saveSessionToStorage(newSession)
        setSession(newSession)
      } else {
        console.log('[Session] API returned error, no session')
        setSession(null)
      }
    } catch (error) {
      console.error('[Session] Error loading session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const clearSession = async () => {
    try {
      console.log('[Session] 🔴 Clearing session...')
      await clearSessionFromStorage()
      setSession(null)
    } catch (error) {
      console.error('[Session] Error clearing session:', error)
    }
  }

  return {
    session,
    loading,
    clearSession,
  }
}

// CloudStorage helpers
async function getSessionFromStorage(): Promise<Session | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.CloudStorage) {
        resolve(null)
        return
      }

      const cloudStorage = (window as any).Telegram.WebApp.CloudStorage

      cloudStorage.getItem(SESSION_KEY, (error: any, value: string) => {
        if (error) {
          console.error('[Session] CloudStorage error:', error)
          resolve(null)
          return
        }

        if (!value) {
          resolve(null)
          return
        }

        try {
          const session = JSON.parse(value) as Session
          resolve(session)
        } catch (parseError) {
          console.error('[Session] Parse error:', parseError)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('[Session] CloudStorage access error:', error)
      resolve(null)
    }
  })
}

async function saveSessionToStorage(session: Session): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.CloudStorage) {
        resolve()
        return
      }

      const cloudStorage = (window as any).Telegram.WebApp.CloudStorage
      const sessionJson = JSON.stringify(session)

      cloudStorage.setItem(SESSION_KEY, sessionJson, (error: any, success: boolean) => {
        if (error || !success) {
          console.error('[Session] CloudStorage save error:', error)
          reject(error)
        } else {
          console.log('[Session] ✅ Saved to CloudStorage')
          resolve()
        }
      })
    } catch (error) {
      console.error('[Session] Save error:', error)
      reject(error)
    }
  })
}

async function clearSessionFromStorage(): Promise<void> {
  return new Promise((resolve) => {
    try {
      console.log('[Session] 🔴 Clearing all session data...')
      
      // Step 1: Clear localStorage COMPLETELY
      if (typeof window !== 'undefined') {
        console.log('[Session] Clearing localStorage...')
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('shef-montazh') || key.includes('auth') || key.includes('session')) {
            console.log('[Session] Removing from localStorage:', key)
            localStorage.removeItem(key)
          }
        })
        // Also clear Supabase specific keys
        localStorage.removeItem('sb-vdpsjxkmbjwkqnlxzlhk-auth-token')
        localStorage.removeItem('sb-vdpsjxkmbjwkqnlxzlhk-auth-token-code-verifier')
        console.log('[Session] ✅ localStorage cleared')
      }

      // Step 2: Clear Telegram CloudStorage
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.CloudStorage) {
        console.log('[Session] Clearing Telegram CloudStorage...')
        const cloudStorage = (window as any).Telegram.WebApp.CloudStorage

        cloudStorage.removeItem(SESSION_KEY, (error: any, success: boolean) => {
          if (error) {
            console.error('[Session] CloudStorage remove error:', error)
          } else if (success) {
            console.log('[Session] ✅ CloudStorage cleared')
          }
          resolve()
        })
      } else {
        resolve()
      }
    } catch (error) {
      console.error('[Session] Clear error:', error)
      resolve()
    }
  })
}

function isSessionExpired(session: Session): boolean {
  return Date.now() > session.expiresAt
}
