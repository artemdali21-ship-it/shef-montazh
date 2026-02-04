'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Building2, Wrench, Plus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import type { UserRole } from '@/types/session'
import toast from 'react-hot-toast'

const roleInfo: Record<UserRole, { icon: React.ReactNode; title: string; description: string; color: string }> = {
  worker: {
    icon: <HardHat className="w-8 h-8" />,
    title: 'Специалист',
    description: 'Работайте монтажником',
    color: 'bg-orange-50 border-orange-200',
  },
  shef: {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Шеф-монтажник',
    description: 'Управляйте командой',
    color: 'bg-purple-50 border-purple-200',
  },
  client: {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Компания',
    description: 'Постройте смены',
    color: 'bg-blue-50 border-blue-200',
  },
}

function RolePickerContent() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()
  const [roles, setRoles] = useState<UserRole[]>([])
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  useEffect(() => {
    if (sessionLoading) return

    if (!session?.telegramId) {
      console.log('[RolePicker] No session, redirecting to home')
      router.push('/')
      return
    }

    const fetchRoles = async () => {
      try {
        // Use session from TelegramSessionManager
        const response = await fetch(`/api/user/roles?telegramId=${session.telegramId}`)
        const data = await response.json()

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
  }, [sessionLoading, session, router])

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role)

    if (!session?.telegramId) {
      toast.error('Telegram ID не найден')
      return
    }

    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: session.telegramId,
          newRole: role,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.error || 'Ошибка переключения роли')
        setSelectedRole(null)
        return
      }

      toast.success('Роль успешно переключена!')

      // Redirect to dashboard
      const dashboardPaths: Record<UserRole, string> = {
        worker: '/worker/shifts',
        shef: '/shef/dashboard',
        client: '/client/shifts',
      }

      window.location.href = dashboardPaths[role]
    } catch (error) {
      console.error('[RolePicker] Error:', error)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Logo className="mb-12" />

        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать!</h1>
            <p className="text-gray-300">Выберите роль для входа</p>
          </div>

          <div className="space-y-3 mb-8">
            {roles.map((role) => {
              const info = roleInfo[role]
              const isSelected = selectedRole === role
              const isLoading = isSelected

              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  disabled={isLoading || selectedRole !== null}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left group ${
                    isLoading
                      ? 'border-gray-500 bg-gray-700 opacity-75'
                      : 'border-gray-600 bg-gray-800 hover:border-white hover:bg-gray-700'
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

          {roles.length > 0 && (
            <div className="text-center text-sm text-gray-400">
              <p>Нужна другая роль?</p>
              <button
                onClick={() => router.push('/settings/add-role')}
                className="mt-2 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить роль
              </button>
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
