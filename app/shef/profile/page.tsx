'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LogOut, Users, Calendar, Star, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import ProfileHeader from '@/components/profile/ProfileHeader'
import SkeletonProfile from '@/components/ui/SkeletonProfile'
import { Logo } from '@/components/ui/Logo'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'

// Lazy load modal - не нужен при первой загрузке
const EditProfileModal = dynamic(() => import('@/components/profile/EditProfileModal'), { ssr: false })

export default function ShefProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()
  const { session, loading: sessionLoading } = useTelegramSession()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  useEffect(() => {
    // Загружаем профиль только один раз
    if (!sessionLoading && session && !profileLoaded) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, profileLoaded])

  const loadProfile = async () => {
    // Prevent multiple calls
    if (profileLoaded || isLoadingProfile) {
      console.log('[ShefProfile] Already loading or loaded, skipping')
      return
    }

    try {
      setIsLoadingProfile(true)
      setLoading(true)

      // Check Telegram session
      if (!session) {
        console.log('[ShefProfile] No session, redirecting to home')
        router.push('/')
        return
      }

      console.log('[ShefProfile] Session found:', session)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      if (userError) throw userError

      setUser(userData)
      setProfileLoaded(true)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Не удалось загрузить профиль')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('Вы уверены, что хотите выйти?')) {
      return
    }

    try {
      if (!session) {
        window.location.href = '/'
        return
      }

      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: session.telegramId }),
      })

      const data = await response.json()

      // Clear CloudStorage
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
    } catch (error) {
      console.error('[Profile] Logout error:', error)
      toast.error('Ошибка при выходе')
    }
  }

  if (sessionLoading || (loading && !user)) {
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
          <SkeletonProfile />
        </div>
      </div>
    )
  }

  if (!session) {
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
          profileType="Профиль шефа"
        />

        {/* Shef Dashboard Button */}
        <button
          onClick={() => router.push('/shef/dashboard')}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-5 h-5" />
          Панель Шефа
        </button>

        {/* Stats - Shef specific */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.total_teams || 0}
            </p>
            <p className="text-xs text-gray-400">Бригад</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.total_shifts || 0}
            </p>
            <p className="text-xs text-gray-400">Смен управлено</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {user.rating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-gray-400">Рейтинг</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-3">
          <h3 className="text-lg font-bold text-white mb-3">Быстрые действия</h3>

          <Link
            href="/shef/teams"
            prefetch={true}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Мои бригады</span>
            <span className="text-gray-400">→</span>
          </Link>

          <Link
            href="/documents"
            prefetch={true}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Документы</span>
            <span className="text-gray-400">→</span>
          </Link>

          <Link
            href="/settings"
            prefetch={true}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <span className="text-white font-medium">Настройки</span>
            <span className="text-gray-400">→</span>
          </Link>
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
