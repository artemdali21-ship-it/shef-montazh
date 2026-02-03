'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, HardHat, Building2, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useTelegram } from '@/lib/telegram'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'

type UserRole = 'worker' | 'client' | 'shef'

const roleInfo: Record<UserRole, { icon: React.ReactNode; title: string; description: string }> = {
  worker: {
    icon: <HardHat className="w-8 h-8" />,
    title: 'Специалист',
    description: 'Работайте на сменах',
  },
  shef: {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Шеф-монтажник',
    description: 'Управляйте командой',
  },
  client: {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Компания',
    description: 'Нанимайте специалистов',
  },
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const tg = useTelegram()
  
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)

  useEffect(() => {
    loadUserRoles()
  }, [])

  const loadUserRoles = async () => {
    try {
      // Get Telegram ID
      const webapp = (window as any).Telegram?.WebApp
      const telegramId = webapp?.initDataUnsafe?.user?.id

      if (!telegramId) {
        console.error('[LoginPage] No Telegram ID')
        setLoading(false)
        return
      }

      console.log('[LoginPage] Loading roles for Telegram ID:', telegramId)

      // Fetch roles from API
      const response = await fetch(`/api/user/roles?telegramId=${telegramId}`)
      const data = await response.json()

      if (data.success && data.roles && data.roles.length > 0) {
        console.log('[LoginPage] Found roles:', data.roles)
        setRoles(data.roles)
        setCurrentRole(data.currentRole || null)
      } else {
        console.log('[LoginPage] No roles found, user needs to register')
        // No roles - user should register
        router.push('/auth/register')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('[LoginPage] Error loading roles:', error)
      toast.error('Ошибка загрузки ролей')
      setLoading(false)
    }
  }

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role)
    setSigningIn(true)

    try {
      const webapp = (window as any).Telegram?.WebApp
      const telegramId = webapp?.initDataUnsafe?.user?.id

      if (!telegramId) {
        toast.error('Telegram ID не найден')
        setSigningIn(false)
        return
      }

      console.log('[LoginPage] Signing in with role:', role)

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Ошибка входа')
        setSigningIn(false)
        setSelectedRole(null)
        return
      }

      console.log('[LoginPage] Sign in successful!')
      toast.success('Вы вошли!')

      // Redirect to dashboard
      const dashboardPaths: Record<UserRole, string> = {
        worker: '/worker/shifts',
        client: '/client/shifts',
        shef: '/shef/dashboard',
      }

      window.location.href = dashboardPaths[role]
    } catch (error: any) {
      console.error('[LoginPage] Error:', error)
      toast.error(error.message || 'Ошибка подключения')
      setSigningIn(false)
      setSelectedRole(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Проверка данных...</p>
        </div>
      </div>
    )
  }

  // If no roles found, redirect to register (should happen above)
  if (roles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <Logo size="lg" showText={true} />
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Аккаунт не найден</h1>
            <p className="text-gray-400">
              Это Telegram ID не зарегистрирован в системе
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
          >
            Создать новый аккаунт
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Выберите роль</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-8">
            <Logo size="md" showText={false} />
            <p className="text-gray-400 mt-4">
              Выберите роль для входа
            </p>
          </div>

          {/* Role selection buttons */}
          <div className="space-y-3">
            {roles.map((role) => {
              const info = roleInfo[role]
              const isSelected = selectedRole === role
              const isLoading = isSelected && signingIn

              return (
                <button
                  key={role}
                  onClick={() => !signingIn && handleSelectRole(role)}
                  disabled={signingIn && !isSelected}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                    isLoading
                      ? 'border-gray-500 bg-gray-700 opacity-75'
                      : 'border-gray-600 bg-gray-800 hover:border-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-300 group-hover:text-white transition-colors mt-1">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-white transition-colors">
                        {info.title}
                      </div>
                      <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {info.description}
                      </div>
                    </div>
                    {isLoading && <div className="text-gray-400 mt-1">...</div>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            disabled={signingIn}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вернуться
          </button>
        </div>
      </div>
    </div>
  )
}
