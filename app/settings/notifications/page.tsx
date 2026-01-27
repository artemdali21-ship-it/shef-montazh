'use client'

import { useState } from 'react'
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Volume2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NoisePattern = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.03,
    }}
  >
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
)

export default function NotificationsSettings() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    soundEnabled: true,

    newShifts: true,
    shiftReminders: true,
    messages: true,
    ratings: true,
    payments: true,
    marketing: false,
  })

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationChannels = [
    {
      key: 'pushEnabled',
      icon: Smartphone,
      label: 'Push-уведомления',
      description: 'Уведомления в приложении',
    },
    {
      key: 'emailEnabled',
      icon: Mail,
      label: 'Email',
      description: 'Уведомления на почту',
    },
    {
      key: 'smsEnabled',
      icon: MessageSquare,
      label: 'SMS',
      description: 'Важные уведомления по SMS',
    },
    {
      key: 'soundEnabled',
      icon: Volume2,
      label: 'Звук',
      description: 'Звуковые оповещения',
    },
  ]

  const notificationTypes = [
    {
      key: 'newShifts',
      label: 'Новые смены',
      description: 'Подходящие вам предложения',
    },
    {
      key: 'shiftReminders',
      label: 'Напоминания о сменах',
      description: 'За 2 часа до начала',
    },
    {
      key: 'messages',
      label: 'Сообщения',
      description: 'Новые сообщения в чатах',
    },
    {
      key: 'ratings',
      label: 'Отзывы и оценки',
      description: 'Новые отзывы о вас',
    },
    {
      key: 'payments',
      label: 'Оплата',
      description: 'Статус выплат',
    },
    {
      key: 'marketing',
      label: 'Маркетинговые',
      description: 'Новости, акции, обновления',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NoisePattern />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10 z-20">
          <div className="h-16 flex items-center justify-between px-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="font-montserrat font-700 text-xl text-white">Уведомления</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6 pb-8">
          {/* Channels Section */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-[#9B9B9B] uppercase tracking-wider mb-3 px-1">
              Каналы уведомлений
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {notificationChannels.map((channel, index) => {
                const Icon = channel.icon
                const isEnabled = settings[channel.key as keyof typeof settings]

                return (
                  <div
                    key={channel.key}
                    className={`flex items-center justify-between p-4 ${
                      index !== notificationChannels.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isEnabled ? 'bg-[#E85D2F]/10' : 'bg-white/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isEnabled ? 'text-[#E85D2F]' : 'text-[#6B6B6B]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-montserrat font-600 text-white mb-0.5">{channel.label}</h4>
                        <p className="text-xs text-white font-montserrat font-500">{channel.description}</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleSetting(channel.key)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        isEnabled ? 'bg-[#E85D2F]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Types Section */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-[#9B9B9B] uppercase tracking-wider mb-3 px-1">
              Типы уведомлений
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {notificationTypes.map((type, index) => {
                const isEnabled = settings[type.key as keyof typeof settings]

                return (
                  <div
                    key={type.key}
                    className={`flex items-center justify-between p-4 ${
                      index !== notificationTypes.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-montserrat font-600 text-white mb-0.5">{type.label}</h4>
                      <p className="text-xs text-white font-montserrat font-500">{type.description}</p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleSetting(type.key)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        isEnabled ? 'bg-[#BFFF00]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-[#FFD60A] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-montserrat font-700 text-white mb-1 text-sm">Не пропустите важное</h4>
                <p className="text-xs text-white font-montserrat font-500 leading-relaxed">
                  Рекомендуем оставить включенными уведомления о новых сменах и напоминания — так вы не пропустите выгодные
                  предложения
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
