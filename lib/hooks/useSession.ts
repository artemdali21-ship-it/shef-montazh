'use client'

import { useEffect, useState } from 'react'
import type { UserRole } from '@/types/session'

interface SessionUser {
  id: string
  telegram_id: number
  full_name: string
  phone?: string
  avatar_url?: string
  roles: UserRole[]
  current_role?: UserRole
  is_verified: boolean
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.status === 401) {
          setUser(null)
          setError('Unauthorized')
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }

        const data = await response.json()
        setUser(data.user)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return {
    user,
    loading,
    error,
    roles: user?.roles || [],
    currentRole: user?.current_role,
    isAuthenticated: user !== null
  }
}
