'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, DollarSign, Calendar, Briefcase, LogOut } from 'lucide-react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import EditProfileModal from '@/components/profile/EditProfileModal'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import SkeletonProfile from '@/components/ui/SkeletonProfile'
import { Logo } from '@/components/ui/Logo'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function ClientProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()
  const { session, loading: sessionLoading } = useTelegramSession()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading])

  const loadProfile = async () => {
    try {
      setLoading(true)

      // Check Telegram session
      if (!session) {
        console.log('[ClientProfile] No session, redirecting to home')
        router.push('/')
        return
      }

      console.log('[ClientProfile] Session found:', session)

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      if (userError) throw userError

      setUser(userData)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Не удалось загрузить профиль')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear Telegram CloudStorage
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      // Force reload to clear session
      window.location.href = '/'
      toast.success('Вы вышли из системы')
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen pb-20 overflow-y-auto">
        <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20 p-4">
          <Logo size="md" showText={true} />
        </header>
        <div className="p-4">
          <SkeletonProfile />
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <div className="min-h-screen pb-20 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center justify-between">
          <Logo size="md" showText={true} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEdit={() => setShowEditModal(true)}
          profileType="Профиль компании"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.total_spent?.toLocaleString('ru-RU') || '0'} ₽
            </p>
            <p className="text-xs text-gray-400">Потрачено</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.total_shifts || 0}
            </p>
            <p className="text-xs text-gray-400">Смен создано</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.successful_shifts || 0}
            </p>
            <p className="text-xs text-gray-400">Завершено</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-3">
          <h3 className="text-lg font-bold text-white mb-3">Быстрые действия</h3>

          <button
            onClick={() => router.push('/create-shift')}
            className="w-full flex items-center justify-between p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl transition"
          >
            <span className="text-orange-400 font-medium">Создать смену</span>
            <span className="text-orange-400">+</span>
          </button>

          <button
            onClick={() => router.push('/client/stats')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Статистика</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push('/shifts')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Мои смены</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push('/documents')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Документы</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push('/client/payments')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">История платежей</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Настройки</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={loadProfile}
        />
      )}
    </div>
  )
}
