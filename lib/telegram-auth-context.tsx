'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTelegram } from '@/lib/telegram'

type UserRole = 'worker' | 'client' | 'shef'

export interface TelegramUser {
  telegramId: number
  userId: string
  fullName: string
  roles: UserRole[]
  currentRole: UserRole
}

interface TelegramAuthContextType {
  user: TelegramUser | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  switchRole: (role: UserRole) => Promise<void>
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined)

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const tg = useTelegram()
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tg?.user?.id) {
      loadUser()
    } else {
      // No Telegram ID - this is web version, not Mini App
      console.log('[TelegramAuth] No Telegram ID detected - web version')
      setLoading(false)
      setError('This app only works in Telegram')
    }
  }, [tg?.user?.id])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!tg?.user?.id) {
        setError('Telegram ID not found')
        setLoading(false)
        return
      }

      console.log('[TelegramAuth] Loading user for Telegram ID:', tg.user.id)

      // Call API to get user data
      const response = await fetch(`/api/auth/user?telegramId=${tg.user.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[TelegramAuth] User not found - needs registration')
          setUser(null)
          setLoading(false)
          return
        }
        throw new Error('Failed to load user')
      }

      const data = await response.json()
      console.log('[TelegramAuth] User loaded:', data.user)

      setUser({
        telegramId: tg.user.id,
        userId: data.user.id,
        fullName: data.user.full_name,
        roles: data.user.roles || ['worker'],
        currentRole: data.user.current_role || data.user.roles[0] || 'worker',
      })
    } catch (err) {
      console.error('[TelegramAuth] Error loading user:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('[TelegramAuth] Logging out...')
      
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear local state
      setUser(null)
      
      console.log('[TelegramAuth] ✅ Logged out')
    } catch (err) {
      console.error('[TelegramAuth] Logout error:', err)
    }
  }

  const switchRole = async (role: UserRole) => {
    try {
      if (!user) return

      console.log('[TelegramAuth] Switching to role:', role)

      // Call API to update current_role
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.telegramId, role }),
      })

      if (!response.ok) {
        throw new Error('Failed to switch role')
      }

      // Update local state
      setUser({ ...user, currentRole: role })
      console.log('[TelegramAuth] ✅ Switched to role:', role)
    } catch (err) {
      console.error('[TelegramAuth] Switch role error:', err)
      throw err
    }
  }

  return (
    <TelegramAuthContext.Provider value={{ user, loading, error, logout, switchRole }}>
      {children}
    </TelegramAuthContext.Provider>
  )
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext)
  if (!context) {
    throw new Error('useTelegramAuth must be used within TelegramAuthProvider')
  }
  return context
}
