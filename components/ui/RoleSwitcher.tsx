'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface RoleSwitcherProps {
  className?: string
}

const ROLE_LABELS: Record<string, string> = {
  worker: 'Исполнитель',
  client: 'Заказчик',
  shef: 'Шеф',
  admin: 'Админ'
}

const ROLE_ROUTES: Record<string, string> = {
  worker: '/worker/shifts',
  client: '/client/shifts',
  shef: '/shef/dashboard',
  admin: '/admin'
}

export default function RoleSwitcher({ className = '' }: RoleSwitcherProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  useEffect(() => {
    loadUserRoles()
  }, [])

  const loadUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('current_role, roles')
        .eq('id', user.id)
        .single()

      if (userData) {
        setCurrentRole(userData.current_role)
        setAvailableRoles(userData.roles || [])
      }
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const switchRole = async (newRole: string) => {
    if (newRole === currentRole) {
      setIsOpen(false)
      return
    }

    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update current_role in database
      const { error } = await supabase
        .from('users')
        .update({ current_role: newRole })
        .eq('id', user.id)

      if (error) throw error

      setCurrentRole(newRole)
      toast.success(`Переключено на роль: ${ROLE_LABELS[newRole]}`)

      // Redirect to appropriate dashboard
      const route = ROLE_ROUTES[newRole] || '/worker/shifts'
      router.push(route)

      setIsOpen(false)
    } catch (error: any) {
      console.error('Error switching role:', error)
      toast.error('Ошибка переключения роли')
    } finally {
      setLoading(false)
    }
  }

  // Don't show if user has only one role
  if (availableRoles.length <= 1) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        <span className="text-sm text-white font-medium">
          {currentRole ? ROLE_LABELS[currentRole] : 'Роль'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 bg-[#2A2A2A] border border-white/10 rounded-lg shadow-xl z-50 min-w-[200px] overflow-hidden">
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-semibold">
                Переключить роль
              </div>

              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg
                    transition text-left
                    ${role === currentRole
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'text-white hover:bg-white/5'
                    }
                  `}
                  disabled={loading}
                >
                  <span className="text-sm font-medium">
                    {ROLE_LABELS[role]}
                  </span>

                  {role === currentRole && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
