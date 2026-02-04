'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, DollarSign, Calendar, TrendingUp, LogOut } from 'lucide-react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import EditProfileModal from '@/components/profile/EditProfileModal'
import CategorySelector from '@/components/profile/CategorySelector'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import SkeletonProfile from '@/components/ui/SkeletonProfile'
import { Logo } from '@/components/ui/Logo'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

export default function WorkerProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()
  const { session, loading: sessionLoading } = useTelegramSession()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [savedCategories, setSavedCategories] = useState<string[]>([])

  useEffect(() => {
    if (!sessionLoading && session) {
      loadProfile()
    }
  }, [sessionLoading, session?.userId])

  const loadProfile = async () => {
    try {
      console.log('[Profile] Loading profile...', { session })

      if (!session) {
        console.log('[Profile] No session')
        router.push('/')
        return
      }

      // Load user profile by user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      console.log('[Profile] User data:', userData, 'Error:', userError)
      console.log('[Profile] Avatar URL:', userData?.avatar_url)

      if (userError) {
        console.error('[Profile] User error:', userError)
        toast.error(`Ошибка загрузки: ${userError.message}`)
        setLoading(false)
        return
      }

      if (!userData) {
        toast.error('Пользователь не найден')
        setLoading(false)
        return
      }

      setUser(userData)

      // Load worker categories
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('categories')
        .eq('user_id', session.userId)
        .maybeSingle()

      if (workerProfile?.categories) {
        setCategories(workerProfile.categories)
        setSavedCategories(workerProfile.categories)
      }

      setLoading(false)
    } catch (error: any) {
      console.error('[Profile] Error:', error)
      toast.error('Ошибка загрузки профиля')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('Вы уверены, что хотите выйти?')) {
      return
    }

    try {
      if (!session) {
        console.log('[Profile] No session for logout')
        window.location.href = '/'
        return
      }

      console.log('[Profile] Logging out, telegramId:', session.telegramId)

      // Call logout API to clear database
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: session.telegramId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка выхода')
      }

      // Clear CloudStorage session
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.CloudStorage) {
        const cloudStorage = (window as any).Telegram.WebApp.CloudStorage
        cloudStorage.removeItem('shef-montazh-session', () => {
          console.log('[Profile] CloudStorage cleared')
        })
      }

      toast.success('Вы вышли из системы')

      // Redirect based on roles
      if (data.multipleRoles) {
        window.location.href = '/role-picker'
      } else {
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('[Profile] Logout error:', error)
      toast.error(error.message || 'Ошибка при выходе')
    }
  }

  const handleSaveCategories = async () => {
    try {
      if (!session) return

      const { error } = await supabase
        .from('worker_profiles')
        .update({ categories })
        .eq('user_id', session.userId)

      if (error) throw error

      toast.success('Категории сохранены')
      await loadProfile()
    } catch (error) {
      console.error('Error saving categories:', error)
      toast.error('Не удалось сохранить категории')
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

  if (!user) {
    return (
      <div className="min-h-screen pb-20 overflow-y-auto">
        <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20 p-4">
          <Logo size="md" showText={true} />
        </header>
        <div className="p-4">
          <div className="text-center text-white mt-20">
            <p>Не удалось загрузить профиль</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-orange-500 rounded-xl"
            >
              Обновить
            </button>
          </div>
        </div>
      </div>
    )
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
          profileType="Профиль исполнителя"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.total_earnings?.toLocaleString('ru-RU') || '0'} ₽
            </p>
            <p className="text-xs text-gray-400">Заработано</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.successful_shifts || 0}
            </p>
            <p className="text-xs text-gray-400">Завершено смен</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.rating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-gray-400">Рейтинг</p>
          </div>
        </div>

        {/* Categories */}
        <CategorySelector
          selectedCategories={categories}
          onChange={setCategories}
        />

        {JSON.stringify(categories.sort()) !== JSON.stringify(savedCategories.sort()) && (
          <button
            onClick={handleSaveCategories}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition"
          >
            Сохранить категории
          </button>
        )}

        {/* Quick actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-3">
          <h3 className="text-lg font-bold text-white mb-3">Быстрые действия</h3>

          <button
            onClick={() => router.push('/worker/stats')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Статистика</span>
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
            onClick={() => router.push('/payments')}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">История выплат</span>
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
