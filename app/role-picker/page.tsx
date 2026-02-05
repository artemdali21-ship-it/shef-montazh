'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Building2, Wrench, Plus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import type { UserRole } from '@/types/session'
import toast from 'react-hot-toast'

const roleInfo: Record<UserRole, { icon: React.ReactNode; title: string; description: string; color: string }> = {
  worker: {
    icon: <HardHat className="w-7 h-7 text-white" />,
    title: 'Специалист',
    description: 'Работаю руками, выхожу на смены',
    color: 'from-orange-500 to-orange-600',
  },
  shef: {
    icon: <Wrench className="w-7 h-7 text-white" />,
    title: 'Шеф-монтажник',
    description: 'Управляю командой и отвечаю за монтаж',
    color: 'from-purple-500 to-purple-600',
  },
  client: {
    icon: <Building2 className="w-7 h-7 text-white" />,
    title: 'Компания',
    description: 'Нанимаю специалистов и организую проекты',
    color: 'from-blue-500 to-blue-600',
  },
}

function RolePickerContent() {
  const router = useRouter()
  const [roles, setRoles] = useState<UserRole[]>([])
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [telegramId, setTelegramId] = useState<number | null>(null)

  useEffect(() => {
    // Get telegramId directly from Telegram WebApp (same as TelegramSessionManager)
    if (typeof window !== 'undefined') {
      const webApp = (window as any).Telegram?.WebApp
      const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
      const mockTelegramId = process.env.NEXT_PUBLIC_MOCK_TELEGRAM_ID || '123456789'

      if (!webApp && !isDevMode) {
        console.error('[RolePicker] Telegram WebApp not found and not in dev mode')
        setLoading(false)
        return
      }

      // Wait for WebApp to be ready
      const initTelegram = () => {
        const userId = webApp?.initDataUnsafe?.user?.id

        if (userId) {
          console.log('[RolePicker] Telegram user ID:', userId)
          setTelegramId(userId)
        } else if (isDevMode) {
          // Use mock ID in dev mode
          console.warn('[RolePicker] No Telegram user ID, using MOCK ID for dev:', mockTelegramId)
          setTelegramId(parseInt(mockTelegramId))
        } else {
          console.log('[RolePicker] No Telegram user ID, redirecting to home')
          setTimeout(() => {
            router.push('/')
          }, 1000)
        }
      }

      if (webApp?.initDataUnsafe?.user?.id) {
        // Already initialized
        initTelegram()
      } else {
        // Wait for initialization or use mock in dev mode
        console.log('[RolePicker] Waiting for Telegram WebApp initialization...')
        setTimeout(initTelegram, 500)
      }
    }
  }, [router])

  useEffect(() => {
    if (!telegramId) return

    const fetchRoles = async () => {
      try {
        console.log('[RolePicker] Fetching roles for telegramId:', telegramId)
        const response = await fetch(`/api/user/roles?telegramId=${telegramId}`)
        const data = await response.json()
        console.log('[RolePicker] Roles response:', data)

        if (data.success) {
          setRoles(data.roles || [])
          setCurrentRole(data.currentRole)

          // If only one role, skip this screen and go directly to dashboard
          if (data.roles && data.roles.length === 1) {
            const dashboardPaths: Record<UserRole, string> = {
              worker: '/worker/shifts',
              shef: '/shef/dashboard',
              client: '/client/shifts',
            }
            router.push(dashboardPaths[data.roles[0]])
            return
          }
        } else {
          toast.error(data.error || 'Ошибка загрузки ролей')
        }
      } catch (error) {
        console.error('[RolePicker] Error fetching roles:', error)
        toast.error('Ошибка подключения')
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [telegramId, router])

  const handleSelectRole = async (role: UserRole) => {
    console.log('[RolePicker] ===== BUTTON CLICKED =====')
    console.log('[RolePicker] Role:', role)
    console.log('[RolePicker] telegramId:', telegramId)
    console.log('[RolePicker] selectedRole:', selectedRole)

    // Check telegramId BEFORE setting selectedRole
    if (!telegramId) {
      console.error('[RolePicker] No telegramId, cannot proceed')
      toast.error('Telegram ID не найден. Перезагрузите приложение.')
      return
    }

    // Now set selected role (after validation)
    setSelectedRole(role)
    console.log('[RolePicker] Starting role switch...')

    try {
      console.log('[RolePicker] Calling API /api/auth/switch-role')
      console.log('[RolePicker] Request body:', { telegramId, newRole: role })

      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: telegramId,
          newRole: role,
        }),
      })

      console.log('[RolePicker] Response status:', response.status)
      const data = await response.json()
      console.log('[RolePicker] Response data:', data)

      if (!data.success) {
        console.error('[RolePicker] ❌ API error:', data.error)
        toast.error(data.error || 'Ошибка переключения роли')
        setSelectedRole(null)
        return
      }

      console.log('[RolePicker] ✅ Role switched successfully!')
      toast.success('Роль успешно переключена!')

      // Redirect to dashboard
      const dashboardPaths: Record<UserRole, string> = {
        worker: '/worker/shifts',
        shef: '/shef/dashboard',
        client: '/client/shifts',
      }

      const redirectPath = dashboardPaths[role]
      console.log('[RolePicker] Redirecting to:', redirectPath)
      window.location.href = redirectPath
    } catch (error: any) {
      console.error('[RolePicker] ❌ Exception:', error)
      console.error('[RolePicker] Error message:', error.message)
      toast.error('Ошибка подключения')
      setSelectedRole(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/tape-3.png"
          alt=""
          style={{
            position: 'absolute',
            top: '15%',
            right: '5%',
            width: '100px',
            height: 'auto',
            opacity: 0.4,
            transform: 'rotate(-20deg)',
            zIndex: 0,
          }}
        />
        <img
          src="/images/bolts.png"
          alt=""
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '3%',
            width: '80px',
            height: 'auto',
            opacity: 0.3,
            transform: 'rotate(15deg)',
            zIndex: 0,
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="flex items-center justify-center mb-8">
          <Logo size="lg" showText={true} />
        </div>

        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать!</h1>
            <p className="text-gray-400">Выберите роль для входа</p>
          </div>

          <div className="space-y-4 mb-8">
            {roles.map((role) => {
              const info = roleInfo[role]
              const isSelected = selectedRole === role
              const isLoading = isSelected

              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  disabled={isLoading || selectedRole !== null}
                  className={`w-full p-6 rounded-2xl border transition-all duration-200 ${
                    isLoading
                      ? 'bg-white/10 border-orange-500 opacity-75'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95'
                  } ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {info.description}
                      </p>
                    </div>
                    {isLoading && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {roles.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              <p>Вы сможете изменить роль, выйдя из личного кабинета</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RolePickerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-white">Загрузка...</div>
        </div>
      }
    >
      <RolePickerContent />
    </Suspense>
  )
}
