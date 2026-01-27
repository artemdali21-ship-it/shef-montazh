'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Eye,
  Globe,
  Moon,
  Smartphone,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
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

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState({
    name: 'Артём Иванов',
    email: 'artem@example.com',
    phone: '+7 (900) 123-45-67',
    avatar: null,
    userType: 'worker',
    rating: 4.8,
    completedShifts: 132,
  })

  const settingsSections = [
    {
      title: 'Аккаунт',
      items: [
        {
          icon: User,
          label: 'Личные данные',
          sublabel: 'Имя, фото, контакты',
          route: '/settings/profile',
          badge: null,
        },
        {
          icon: Briefcase,
          label: 'Профессиональная информация',
          sublabel: 'Специализации, опыт, ставки',
          route: '/settings/professional',
          badge: null,
        },
        {
          icon: MapPin,
          label: 'Локация и районы',
          sublabel: 'Предпочитаемые районы работы',
          route: '/settings/location',
          badge: null,
        },
      ],
    },
    {
      title: 'Настройки',
      items: [
        {
          icon: Bell,
          label: 'Уведомления',
          sublabel: 'Push, email, SMS',
          route: '/settings/notifications',
          badge: '3',
        },
        {
          icon: Shield,
          label: 'Безопасность',
          sublabel: 'Пароль, верификация',
          route: '/settings/security',
          badge: null,
        },
        {
          icon: Eye,
          label: 'Приватность',
          sublabel: 'Видимость профиля, данные',
          route: '/settings/privacy',
          badge: null,
        },
        {
          icon: Moon,
          label: 'Внешний вид',
          sublabel: 'Тема, язык',
          route: '/settings/appearance',
          badge: null,
        },
      ],
    },
    {
      title: 'Платежи',
      items: [
        {
          icon: CreditCard,
          label: 'Способы оплаты',
          sublabel: 'Карты, СЗ, реквизиты',
          route: '/settings/payment',
          badge: null,
        },
      ],
    },
    {
      title: 'Поддержка',
      items: [
        {
          icon: HelpCircle,
          label: 'Помощь',
          sublabel: 'FAQ, гайды, контакты',
          route: '/settings/help',
          badge: null,
        },
        {
          icon: Globe,
          label: 'О платформе',
          sublabel: 'Версия 1.0.0',
          route: '/settings/about',
          badge: null,
        },
      ],
    },
  ]

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div
      style={{
      height: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      }}
    >
      <NoisePattern />

      <div className="relative z-10 pb-24">
        {/* Header */}
        <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10 z-20">
          <div className="h-16 flex items-center justify-between px-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="font-montserrat font-700 text-xl text-white">Настройки</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Profile Card */}
        <div className="px-4 pt-6 pb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E85D2F] to-[#D94D1F] rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl font-montserrat font-800 text-white">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#BFFF00] rounded-full flex items-center justify-center border-2 border-[#2A2A2A]">
                  <Camera className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-montserrat font-700 text-xl text-white mb-1 truncate">{user.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[#FFD60A] text-lg">★</span>
                    <span className="font-montserrat font-700 text-white">{user.rating}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#6B6B6B]"></div>
                  <span className="text-sm text-[#9B9B9B] font-montserrat font-500">{user.completedShifts} смен</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="px-2 py-1 bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-md">
                    <span className="text-xs text-[#BFFF00] font-montserrat font-700 uppercase">Монтажник</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-montserrat font-800 text-white mb-1">98%</p>
                <p className="text-xs text-[#9B9B9B] font-montserrat font-500">Надёжность</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-montserrat font-800 text-white mb-1">24</p>
                <p className="text-xs text-[#9B9B9B] font-montserrat font-500">Повторных</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-montserrat font-800 text-white mb-1">0</p>
                <p className="text-xs text-[#9B9B9B] font-montserrat font-500">Срывов</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-4 space-y-6 pb-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <h3 className="text-xs font-montserrat font-700 text-[#9B9B9B] uppercase tracking-wider mb-3 px-1">
                {section.title}
              </h3>

              {/* Section Items */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => router.push(item.route)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors ${
                        itemIndex !== section.items.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#E85D2F]" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-montserrat font-600 text-white truncate">{item.label}</h4>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 bg-[#E85D2F] rounded-md text-[10px] font-montserrat font-700 text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9B9B9B] font-montserrat font-500 truncate">{item.sublabel}</p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-montserrat font-700 text-red-500">Выйти из аккаунта</span>
          </button>

          {/* App Version */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#6B6B6B] font-montserrat font-500">ШЕФ-МОНТАЖ • Версия 1.0.0 (MVP)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
