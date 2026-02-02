'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Building2, Wrench, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import type { UserRole } from '@/types/session'
import toast from 'react-hot-toast'

const roleInfo: Record<UserRole, { icon: React.ReactNode; title: string; description: string }> = {
  worker: {
    icon: <HardHat className="w-8 h-8" />,
    title: 'Специалист',
    description: 'Работайте монтажником, декоратором или техником. Получайте смены от компаний.',
  },
  shef: {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Шеф-монтажник',
    description: 'Управляйте командой, координируйте бригады, курируйте проекты.',
  },
  client: {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Компания',
    description: 'Размещайте смены, ищите специалистов, управляйте проектами.',
  },
}

export default function AddRolePage() {
  const router = useRouter()
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allRoles: UserRole[] = ['worker', 'shef', 'client']

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        // Get telegram ID from session/auth
        const response = await fetch('/api/auth/me')
        const userData = await response.json()

        if (userData.user) {
          const userRoles = userData.user.roles || []
          const available = allRoles.filter((role) => !userRoles.includes(role))
          setAvailableRoles(available)

          if (available.length === 0) {
            toast.error('У вас уже есть все роли')
            router.back()
          }
        } else {
          toast.error('Ошибка загрузки профиля')
          router.back()
        }
      } catch (error) {
        console.error('[AddRole] Error:', error)
        toast.error('Ошибка подключения')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRoles()
  }, [router])

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role)
    setIsSubmitting(true)

    try {
      // Get telegram ID from session
      const response = await fetch('/api/auth/me')
      const userData = await response.json()

      if (!userData.user) {
        toast.error('Ошибка загрузки профиля')
        setSelectedRole(null)
        setIsSubmitting(false)
        return
      }

      // Register with new role
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: userData.user.telegram_id,
          role,
          fullName: userData.user.full_name,
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerData.success) {
        toast.error(registerData.error || 'Ошибка добавления роли')
        setSelectedRole(null)
        setIsSubmitting(false)
        return
      }

      toast.success(`Роль "${roleInfo[role].title}" добавлена!`)

      // Redirect to profile setup for new role
      const setupPaths: Record<UserRole, string> = {
        worker: '/profile-setup/worker',
        shef: '/profile-setup/shef',
        client: '/profile-setup/client',
      }

      window.location.href = setupPaths[role]
    } catch (error) {
      console.error('[AddRole] Error:', error)
      toast.error('Ошибка подключения')
      setSelectedRole(null)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (availableRoles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-6">У вас уже есть все роли</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      <div className="p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Logo className="mb-12" />

        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Добавить роль</h1>
            <p className="text-gray-300">
              Выберите новую роль для добавления к вашему аккаунту
            </p>
          </div>

          <div className="space-y-3">
            {availableRoles.map((role) => {
              const info = roleInfo[role]
              const isSelected = selectedRole === role
              const isLoading = isSelected

              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  disabled={isLoading || isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left group ${
                    isLoading
                      ? 'border-gray-500 bg-gray-700 opacity-75'
                      : 'border-gray-600 bg-gray-800 hover:border-white hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-300 group-hover:text-white transition-colors mt-0.5">
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
                    {isLoading && <div className="text-gray-400 mt-1 animate-pulse">...</div>}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-2">О множественных ролях</h3>
            <p className="text-sm text-gray-400">
              Вы можете иметь несколько ролей на одном аккаунте и переключаться между ними в любой
              момент. Каждая роль имеет свой профиль и настройки.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
