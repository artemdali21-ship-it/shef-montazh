'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/types/notifications'
import toast from 'react-hot-toast'

export default function ClientNotificationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({
          new_shifts: data.new_shifts ?? true,
          application_approved: data.applications ?? true,
          shift_reminders: data.shift_reminders ?? true,
          payments: data.payments ?? true,
          messages: data.messages ?? true,
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Не авторизован')
        return
      }

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          new_shifts: settings.new_shifts,
          applications: settings.application_approved,
          shift_reminders: settings.shift_reminders,
          payments: settings.payments,
          messages: settings.messages,
        })

      if (error) throw error

      toast.success('Настройки сохранены')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-h1 text-white">Уведомления</h1>
            <p className="text-body-small text-gray-400">Настройте push-уведомления</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 mb-1 font-medium">
                Уведомления через Telegram
              </p>
              <p className="text-xs text-blue-300/70">
                Вы будете получать уведомления в Telegram бот
              </p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Типы уведомлений</h2>
          </div>

          <div className="divide-y divide-white/10">
            {/* New Applications */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-0.5">Новые отклики</p>
                <p className="text-xs text-gray-400">Когда исполнители откликаются на смену</p>
              </div>
              <button
                onClick={() => handleToggle('application_approved')}
                className={`relative w-12 h-7 rounded-full transition ${
                  settings.application_approved ? 'bg-orange-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.application_approved ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Check-in Alerts */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-0.5">Выход на объект</p>
                <p className="text-xs text-gray-400">Когда исполнитель отметился на месте</p>
              </div>
              <button
                onClick={() => handleToggle('shift_reminders')}
                className={`relative w-12 h-7 rounded-full transition ${
                  settings.shift_reminders ? 'bg-orange-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.shift_reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Shift Reminders */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-0.5">Напоминания о сменах</p>
                <p className="text-xs text-gray-400">За час до начала смены</p>
              </div>
              <button
                onClick={() => handleToggle('shift_reminders')}
                className={`relative w-12 h-7 rounded-full transition ${
                  settings.shift_reminders ? 'bg-orange-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.shift_reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Payment Reminders */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-0.5">Напоминания об оплате</p>
                <p className="text-xs text-gray-400">Когда нужно оплатить смену</p>
              </div>
              <button
                onClick={() => handleToggle('payments')}
                className={`relative w-12 h-7 rounded-full transition ${
                  settings.payments ? 'bg-orange-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.payments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-0.5">Новые сообщения</p>
                <p className="text-xs text-gray-400">Когда вам пишут в чате</p>
              </div>
              <button
                onClick={() => handleToggle('messages')}
                className={`relative w-12 h-7 rounded-full transition ${
                  settings.messages ? 'bg-orange-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.messages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить настройки
            </>
          )}
        </button>
      </div>
    </main>
  )
}
