'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import toast from 'react-hot-toast'

interface LogoutButtonProps {
  variant?: 'button' | 'text'
  className?: string
}

export default function LogoutButton({ variant = 'button', className = '' }: LogoutButtonProps) {
  const router = useRouter()
  const tg = useTelegram()
  const { clearSession } = useTelegramSession()
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
        return
      }

      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Ошибка выхода')
        return
      }

      // Clear session from CloudStorage
      await clearSession()

      toast.success('Вы вышли из системы')

      // If multiple roles, show role picker. Otherwise go to home
      if (data.multipleRoles) {
        router.push('/role-picker')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('[LogoutButton] Error:', error)
      toast.error('Ошибка подключения')
    } finally {
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
