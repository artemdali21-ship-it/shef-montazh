'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, HardHat, Building2, Wrench } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'
import TelegramGuard from '@/components/auth/TelegramGuard'

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

function LoginPageContent() {
  const router = useRouter()
  const tg = useTelegram()
  
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])

  useEffect(() => {
    if (tg?.user?.id) {
      loadUserRoles()
    }
  }, [tg?.user?.id])

  const loadUserRoles = async () => {
    try {
      if (!tg?.user?.id) {
        setLoading(false)
        return
      }

      console.log('[LoginPage] Loading roles for Telegram ID:', tg.user.id)

      // Fetch user data from NEW API
      const response = await fetch(`/api/auth/user?telegramId=${tg.user.id}`)

      if (response.status === 404) {
        console.log('[LoginPage] User not registered, redirect to register')
        router.push('/auth/register')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load roles')
      }

      const data = await response.json()

      if (data.user?.roles && data.user.roles.length > 0) {
        console.log('[LoginPage] Found roles:', data.user.roles)
        setRoles(data.user.roles)
      } else {
        console.log('[LoginPage] No roles, redirecting to register')
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
      if (!tg?.user?.id) {
        toast.error('Telegram ID не найден')
        setSigningIn(false)
        return
      }

      console.log('[LoginPage] Signing in with role:', role)

      // Call switch-role API
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tg.user.id,
          role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Ошибка входа')
        setSigningIn(false)
        setSelectedRole(null)
        return
      }

      console.log('[LoginPage] ✅ Sign in successful!')
      toast.success('Добро пожаловать!')

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

  // If no roles found, should have redirected to register above
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

export default function LoginPage() {
  return (
    <TelegramGuard>
      <LoginPageContent />
    </TelegramGuard>
  )
}
