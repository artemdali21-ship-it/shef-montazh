'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  User,
  Bell,
  Shield,
  Info,
  Trash2,
  MapPin,
  Globe,
  Palette
} from 'lucide-react'
import SettingsSection from '@/components/settings/SettingsSection'
import SettingRow from '@/components/settings/SettingRow'
import LogoutButton from '@/components/common/LogoutButton'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import ErrorState from '@/components/ui/ErrorState'

export default function WorkerSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Вы уверены, что хотите удалить аккаунт? Это действие необратимо.'
    )

    if (!confirmed) return

    try {
      setDeleting(true)

      // Delete user data
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      // Sign out
      await supabase.auth.signOut()

      toast.success('Аккаунт удалён')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Не удалось удалить аккаунт')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <ErrorState
        message="Не удалось загрузить профиль"
        onRetry={loadUser}
      />
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Настройки</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Account Section */}
        <SettingsSection title="Аккаунт" icon={User}>
          <SettingRow
            label="Профиль"
            value={user.full_name}
            onClick={() => router.push('/worker/profile')}
          />
          <SettingRow label="ID" value={user.telegram_id} />
          <SettingRow label="Телефон" value={user.phone || 'Не указан'} />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Уведомления" icon={Bell}>
          <SettingRow
            label="Настройки уведомлений"
            onClick={() => router.push('/settings/notifications')}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Предпочтения" icon={Palette}>
          <SettingRow label="Язык" value="Русский" />
          <SettingRow label="Город" value="Не указан" />
          <SettingRow label="Тема" value="Тёмная" />
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title="Конфиденциальность" icon={Shield}>
          <SettingRow
            label="Политика конфиденциальности"
            onClick={() => window.open('/privacy', '_blank')}
          />
          <SettingRow
            label="Условия использования"
            onClick={() => window.open('/terms', '_blank')}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="О приложении" icon={Info}>
          <SettingRow label="Версия" value="1.0.0" />
          <SettingRow
            label="Поддержка"
            onClick={() => router.push('/support')}
          />
        </SettingsSection>

        {/* Logout Button */}
        <LogoutButton className="w-full" />

        {/* Danger Zone */}
        <SettingsSection title="Опасная зона" icon={Trash2}>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="
              w-full py-3 mt-2 mb-2
              bg-red-500/10 border border-red-500/20 rounded-xl
              text-red-400 font-medium hover:bg-red-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {deleting ? 'Удаление...' : 'Удалить аккаунт'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Это действие необратимо. Все ваши данные будут удалены.
          </p>
        </SettingsSection>
      </div>
    </div>
  )
}
