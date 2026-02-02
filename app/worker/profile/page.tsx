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
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    // Загружаем профиль только один раз
    if (!sessionLoading && session && !profileLoaded) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, profileLoaded])

  const loadProfile = async () => {
    // Prevent multiple calls
    if (profileLoaded || loading) {
      console.log('[Profile] Already loading or loaded, skipping')
      return
    }

    try {
      setLoading(true)

      console.log('[Profile] Loading profile...')

      // Check Telegram session
      if (!session) {
        console.log('[Profile] No session, redirecting to home')
        router.push('/')
        return
      }

      console.log('[Profile] Session found:', session)

      // Load user profile by user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      console.log('[Profile] User data:', userData, 'Error:', userError)

      if (userError) {
        console.error('[Profile] User error:', userError)
        throw new Error(`Не удалось загрузить данные пользователя: ${userError.message}`)
      }

      if (!userData) {
        throw new Error('Пользователь не найден')
      }

      setUser(userData)
      setProfileLoaded(true)

      // Load worker categories from worker_profiles
      const { data: workerProfile, error: profileError } = await supabase
        .from('worker_profiles')
        .select('categories')
        .eq('user_id', session.userId)
        .maybeSingle()

      console.log('[Profile] Worker profile:', workerProfile, 'Error:', profileError)

      if (profileError) {
        console.error('[Profile] Worker profile error:', profileError)
        // Don't throw - just log and continue without categories
        toast.error(`Ошибка загрузки профиля работника: ${profileError.message}`)
      }

      if (!workerProfile) {
        console.log('[Profile] No worker profile found, creating one...')
        // Create worker profile if doesn't exist
        const { error: createError } = await supabase
          .from('worker_profiles')
          .insert({ user_id: session.userId })

        if (createError) {
          console.error('[Profile] Error creating worker profile:', createError)
        }

        setCategories([])
        setSavedCategories([])
      } else if (workerProfile?.categories) {
        setCategories(workerProfile.categories)
        setSavedCategories(workerProfile.categories)
      } else {
        setCategories([])
        setSavedCategories([])
      }
    } catch (error: any) {
      console.error('[Profile] Error loading profile:', error)
      toast.error(error.message || 'Не удалось загрузить профиль')
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

  const handleSaveCategories = async () => {
    try {
      if (!session) return

      // Update worker_profiles with selected categories
      const { error } = await supabase
        .from('worker_profiles')
        .update({ categories })
        .eq('user_id', session.userId)

      if (error) throw error

      toast.success('Категории сохранены')

      // Reload profile to show updated data
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
