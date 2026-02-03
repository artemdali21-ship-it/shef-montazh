'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

interface LogoutButtonProps {
  variant?: 'button' | 'text'
  className?: string
}

export default function LogoutButton({ variant = 'button', className = '' }: LogoutButtonProps) {
  const router = useRouter()
  const tg = useTelegram()
  const { clearSession } = useTelegramSession()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (!confirm('Вы уверены, что хотите выйти?')) {
      return
    }

    setLoading(true)

    try {
      const telegramId = tg?.user?.id
      if (!telegramId) {
        toast.error('Telegram ID не найден')
        setLoading(false)
        return
      }

      console.log('[Logout] 🔴 STARTING LOGOUT PROCESS for Telegram ID:', telegramId)

      // Step 1: Clear CloudStorage and localStorage ПЕРВЫМ делом
      console.log('[Logout] Step 1: Clearing session from memory and storage...')
      await clearSession()
      console.log('[Logout] ✅ Session cleared')

      // Step 2: Sign out from Supabase Auth (КРИТИЧНО!)
      console.log('[Logout] Step 2: Signing out from Supabase Auth...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('[Logout] ⚠️ Sign out error:', signOutError)
      } else {
        console.log('[Logout] ✅ Supabase Auth signed out')
      }

      // Step 3: Call logout API для очистки DB (текущая роль и сессия)
      console.log('[Logout] Step 3: Calling logout API to clear database...')
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('[Logout] ⚠️ API error:', data.error)
      } else {
        console.log('[Logout] ✅ API logout successful')
      }

      toast.success('Вы вышли из системы')
      console.log('[Logout] Step 4: Redirecting to welcome page...')

      // Step 4: HARD REDIRECT to welcome (не используем router.push чтобы избежать кэша)
      setTimeout(() => {
        window.location.href = '/auth/welcome'
      }, 300)
    } catch (error) {
      console.error('[LogoutButton] Error:', error)
      toast.error('Ошибка подключения')
      setLoading(false)
    }
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`flex items-center gap-2 text-red-400 hover:text-red-300 transition ${className}`}
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">{loading ? 'Выход...' : 'Выйти'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span className="text-sm font-medium">{loading ? 'Выход...' : 'Выйти'}</span>
    </button>
  )
}
