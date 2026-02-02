'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Building, Briefcase } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import type { UserRole } from '@/types/session'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

const roles = [
  {
    value: 'worker' as UserRole,
    label: 'Работник',
    description: 'Ищу работу на смены',
    icon: HardHat,
    color: 'from-orange-500 to-orange-600',
  },
  {
    value: 'client' as UserRole,
    label: 'Заказчик',
    description: 'Нужны работники',
    icon: Building,
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: 'shef' as UserRole,
    label: 'Шеф',
    description: 'Управляю бригадами',
    icon: Briefcase,
    color: 'from-purple-500 to-purple-600',
  },
]

export default function RoleSelector() {
  const router = useRouter()
  const tg = useTelegram()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role)
    setLoading(true)

    try {
      const telegramId = tg?.user?.id
      if (!telegramId) {
        toast.error('Telegram ID не найден')
        return
      }

      // Register user with selected role
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          role,
          fullName: tg?.user?.first_name || 'User',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          toast.error('Вы уже зарегистрированы')
        } else {
          toast.error(data.error || 'Ошибка регистрации')
        }
        return
      }

      toast.success('Регистрация успешна!')

      // Redirect to onboarding
      router.push(`/onboarding/${role}`)
    } catch (error) {
      console.error('[RoleSelector] Error:', error)
      toast.error('Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Выберите роль
          </h1>
          <p className="text-gray-400">
            Кем вы хотите быть на платформе?
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.value

            return (
              <button
                key={role.value}
                onClick={() => handleSelectRole(role.value)}
                disabled={loading}
                className={`w-full p-6 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/10 border-orange-500 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {role.label}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {role.description}
                    </p>
                  </div>
                  {loading && isSelected && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Вы сможете изменить роль позже в настройках
        </p>
      </div>
    </div>
  )
}
