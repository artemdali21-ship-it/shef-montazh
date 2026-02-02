'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Building2, Wrench, Plus, LogOut, ChevronDown } from 'lucide-react'
import type { UserRole } from '@/types/session'
import toast from 'react-hot-toast'

interface RoleSwitcherProps {
  currentRole: UserRole
  availableRoles: UserRole[]
  telegramId: number
  userName: string
}

const roleInfo: Record<UserRole, { icon: React.ReactNode; title: string; color: string }> = {
  worker: {
    icon: <HardHat className="w-4 h-4" />,
    title: 'Специалист',
    color: 'text-orange-500',
  },
  shef: {
    icon: <Wrench className="w-4 h-4" />,
    title: 'Шеф-монтажник',
    color: 'text-purple-500',
  },
  client: {
    icon: <Building2 className="w-4 h-4" />,
    title: 'Компания',
    color: 'text-blue-500',
  },
}

export function RoleSwitcher({
  currentRole,
  availableRoles,
  telegramId,
  userName,
}: RoleSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSwitchRole = async (role: UserRole) => {
    if (role === currentRole) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          newRole: role,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.error || 'Ошибка переключения роли')
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
      console.error('[RoleSwitcher] Error:', error)
      toast.error('Ошибка подключения')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    // Clear session and redirect to role-select
    localStorage.removeItem('userRole')
    window.location.href = '/role-select'
  }

  const handleAddRole = () => {
    router.push('/settings/add-role')
    setIsOpen(false)
  }

  const currentRoleInfo = roleInfo[currentRole]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <div className={currentRoleInfo.color}>{currentRoleInfo.icon}</div>
          <div className="text-left hidden sm:block">
            <div className="text-xs text-gray-500 dark:text-gray-400">Роль</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentRoleInfo.title}
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Профиль</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {userName}
            </div>
          </div>

          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5">
              Ваши роли
            </div>

            {availableRoles.map((role) => {
              const info = roleInfo[role]
              const isActive = role === currentRole

              return (
                <button
                  key={role}
                  onClick={() => handleSwitchRole(role)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={info.color}>{info.icon}</div>
                  <span className="text-sm flex-1">{info.title}</span>
                  {isActive && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                </button>
              )
            })}
          </div>

          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAddRole}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Добавить роль</span>
            </button>
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
