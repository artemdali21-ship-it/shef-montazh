'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, DollarSign, MessageCircle, Settings, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NoisePattern } from '@/components/noise-pattern'
import { getUserRole } from '@/lib/auth'

interface NotificationSettings {
  newShifts: boolean
  shiftApproved: boolean
  newApplications: boolean
  shiftReminders: boolean
  paymentReceived: boolean
  paymentOverdue: boolean
  newMessages: boolean
  ratingsReceived: boolean
  systemUpdates: boolean
}

export default function NotificationsSettings() {
  const router = useRouter()
  const userRole = getUserRole()

  const [settings, setSettings] = useState<NotificationSettings>({
    newShifts: true,
    shiftApproved: true,
    newApplications: true,
    shiftReminders: true,
    paymentReceived: true,
    paymentOverdue: true,
    newMessages: true,
    ratingsReceived: true,
    systemUpdates: true,
  })

  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real app, fetch from Supabase
        // const { data } = await supabase
        //   .from('user_notification_settings')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single()
        console.log('[v0] Fetching notification settings')
      } catch (error) {
        console.error('[v0] Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const toggleSetting = async (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    setSaveMessage(null)

    try {
      setLoading(true)
      // Save to Supabase
      // await supabase
      //   .from('user_notification_settings')
      //   .upsert({ user_id: user.id, [key]: newSettings[key] })

      console.log(`[v0] Setting ${key} updated to ${newSettings[key]}`)
      setSaveMessage({ type: 'success', text: 'Настройка обновлена' })
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      console.error('[v0] Error saving setting:', error)
      setSettings(settings) // Rollback
      setSaveMessage({ type: 'error', text: 'Ошибка при сохранении' })
    } finally {
      setLoading(false)
    }
  }

  const handleDisableAll = async () => {
    const allDisabled = Object.keys(settings).reduce((acc, key) => {
      acc[key as keyof NotificationSettings] = key === 'systemUpdates' // Keep system updates on
      return acc
    }, {} as NotificationSettings)

    setSettings(allDisabled)
    setSaveMessage({ type: 'success', text: 'Все уведомления отключены' })
    setTimeout(() => setSaveMessage(null), 2000)
  }

  const handleEnableAll = async () => {
    const allEnabled = Object.keys(settings).reduce((acc, key) => {
      acc[key as keyof NotificationSettings] = true
      return acc
    }, {} as NotificationSettings)

    setSettings(allEnabled)
    setSaveMessage({ type: 'success', text: 'Все уведомления включены' })
    setTimeout(() => setSaveMessage(null), 2000)
  }

  const handleTestNotification = async () => {
    try {
      setTestLoading(true)
      // Send test notification via API
      // const response = await fetch('/api/notifications/test', { method: 'POST' })
      console.log('[v0] Sending test notification')
      setSaveMessage({ type: 'success', text: 'Тестовое уведомление отправлено в Telegram' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('[v0] Error sending test notification:', error)
      setSaveMessage({ type: 'error', text: 'Ошибка при отправке тестового уведомления' })
    } finally {
      setTestLoading(false)
    }
  }

  // Define notifications based on user role
  const shiftsSection = [
    {
      key: 'newShifts' as const,
      label: 'Новые смены в районе',
      description: 'Уведомления о подходящих сменах',
      visible: userRole === 'worker',
    },
    {
      key: 'shiftApproved' as const,
      label: 'Одобрение откликов',
      description: 'Когда заказчик одобрил ваш отклик',
      visible: userRole === 'worker',
    },
    {
      key: 'newApplications' as const,
      label: 'Новые отклики на смену',
      description: 'Когда исполнитель откликнулся',
      visible: userRole === 'client',
    },
    {
      key: 'shiftReminders' as const,
      label: 'Напоминания о сменах',
      description: 'За 1 час до начала смены',
      visible: true,
    },
  ].filter((n) => n.visible)

  const paymentsSection = [
    {
      key: 'paymentReceived' as const,
      label: 'Уведомления об оплате',
      description: 'Когда смена оплачена',
      visible: true,
    },
    {
      key: 'paymentOverdue' as const,
      label: 'Просрочка оплаты',
      description: 'Когда оплата просрочена >3 дней',
      visible: userRole === 'worker',
    },
  ].filter((n) => n.visible)

  const communicationSection = [
    {
      key: 'newMessages' as const,
      label: 'Новые сообщения',
      description: 'Сообщения в чате',
      visible: true,
    },
    {
      key: 'ratingsReceived' as const,
      label: 'Оценки и отзывы',
      description: 'Когда вас оценили',
      visible: true,
    },
  ].filter((n) => n.visible)

  const systemSection = [
    {
      key: 'systemUpdates' as const,
      label: 'Важные обновления',
      description: 'Новые функции и изменения',
      visible: true,
      disabled: true,
    },
  ]

  const NotificationToggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-[#E85D2F]' : 'bg-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      ></div>
    </button>
  )

  const NotificationItem = ({
    item,
  }: {
    item: {
      key: keyof NotificationSettings
      label: string
      description: string
      disabled?: boolean
    }
  }) => (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0">
      <div className="flex-1 min-w-0 mr-3">
        <h4 className="font-montserrat font-600 text-white mb-0.5">{item.label}</h4>
        <p className="text-xs text-white/70 font-montserrat font-500">{item.description}</p>
      </div>

      <NotificationToggle
        checked={settings[item.key]}
        onChange={() => !item.disabled && toggleSetting(item.key)}
        disabled={item.disabled}
      />
    </div>
  )

  const SectionCard = ({ title, icon: Icon, items }: { title: string; icon: any; items: any[] }) => (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className="w-4 h-4 text-[#E85D2F]" />
        <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {items.map((item, index) => (
          <NotificationItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NoisePattern />

      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10 z-20">
          <div className="h-16 flex items-center justify-between px-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 ml-4">
              <h1 className="font-montserrat font-700 text-lg text-white">Настройки уведомлений</h1>
              <p className="text-xs text-white/60 font-montserrat font-500">Управляйте уведомлениями в Telegram</p>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24">
          {/* SHIFTS SECTION */}
          {shiftsSection.length > 0 && <SectionCard title="Смены" icon={Bell} items={shiftsSection} />}

          {/* PAYMENTS SECTION */}
          {paymentsSection.length > 0 && <SectionCard title="Оплаты" icon={DollarSign} items={paymentsSection} />}

          {/* COMMUNICATION SECTION */}
          {communicationSection.length > 0 && <SectionCard title="Коммуникация" icon={MessageCircle} items={communicationSection} />}

          {/* SYSTEM SECTION */}
          <SectionCard title="Система" icon={Settings} items={systemSection} />

          {/* NOTIFICATION METHOD INFO */}
          <div className="bg-[#E85D2F]/10 border border-[#E85D2F]/30 rounded-lg p-4">
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-[#E85D2F] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-montserrat font-700 text-white mb-2 text-sm">💬 Уведомления приходят в Telegram</h4>
                <p className="text-xs text-white font-montserrat font-500 leading-relaxed">
                  Убедитесь, что бот @ShefMontazhBot не заблокирован
                </p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDisableAll}
              className="h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-montserrat font-600 text-sm hover:bg-white/15 transition-colors"
            >
              Отключить все
            </button>
            <button
              onClick={handleEnableAll}
              className="h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-montserrat font-600 text-sm hover:bg-white/15 transition-colors"
            >
              Включить все
            </button>
          </div>

          {/* TEST NOTIFICATION */}
          <button
            onClick={handleTestNotification}
            disabled={testLoading}
            className="w-full h-10 rounded-lg bg-[#E85D2F] hover:bg-[#D04D1F] disabled:opacity-50 text-white font-montserrat font-600 text-sm transition-colors"
          >
            {testLoading ? 'Отправка...' : 'Отправить тестовое уведомление'}
          </button>

          {/* SAVE MESSAGE */}
          {saveMessage && (
            <div
              className={`flex items-center gap-2 p-4 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-[#BFFF00]/10 border border-[#BFFF00]/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#BFFF00] flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <p
                className={`text-sm font-montserrat font-600 ${
                  saveMessage.type === 'success' ? 'text-[#BFFF00]' : 'text-red-500'
                }`}
              >
                {saveMessage.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
