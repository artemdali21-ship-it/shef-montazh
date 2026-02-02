'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, CheckCircle } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import type { UserRole } from '@/types/session'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

interface OnboardingProps {
  role: UserRole
}

const onboardingScreens = {
  worker: [
    {
      title: 'Найдите работу быстро',
      description: 'Просматривайте доступные смены и откликайтесь на подходящие вакансии',
      icon: '🔍',
    },
    {
      title: 'Гарантия выплат',
      description: 'Получайте оплату сразу после завершения работы',
      icon: '💰',
    },
    {
      title: 'Поддержка 24/7',
      description: 'Мы всегда на связи, чтобы помочь вам в любой ситуации',
      icon: '🤝',
    },
  ],
  client: [
    {
      title: 'Найдите профи быстро',
      description: 'Доступ к базе проверенных работников с рейтингом и отзывами',
      icon: '⭐',
    },
    {
      title: 'Удобное управление',
      description: 'Создавайте смены, отслеживайте статус и общайтесь с работниками',
      icon: '📊',
    },
    {
      title: 'Гарантии качества',
      description: 'Система рейтингов и отзывов гарантирует качество работы',
      icon: '✅',
    },
  ],
  shef: [
    {
      title: 'Управляйте бригадами',
      description: 'Координируйте работу команд и распределяйте задачи',
      icon: '👥',
    },
    {
      title: 'Контроль в реальном времени',
      description: 'Отслеживайте прогресс работ и общайтесь с командой',
      icon: '📱',
    },
    {
      title: 'Аналитика и отчёты',
      description: 'Получайте детальную статистику по работе бригад',
      icon: '📈',
    },
  ],
}

export default function Onboarding({ role }: OnboardingProps) {
  const router = useRouter()
  const tg = useTelegram()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [loading, setLoading] = useState(false)

  const screens = onboardingScreens[role]
  const isLastScreen = currentScreen === screens.length - 1

  const handleNext = () => {
    if (!isLastScreen) {
      setCurrentScreen(currentScreen + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const telegramId = tg?.user?.id
      if (!telegramId) {
        toast.error('Telegram ID не найден')
        return
      }

      // Mark onboarding as complete
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Ошибка завершения онбординга')
        return
      }

      // Redirect to role-specific dashboard with force reload to refresh session
      const dashboardPaths = {
        worker: '/worker/shifts',
        client: '/client/shifts',
        shef: '/shef/dashboard',
      }

      console.log('[Onboarding] Redirecting to:', dashboardPaths[role])

      // Force reload to ensure session is refreshed with new role
      window.location.href = dashboardPaths[role]
    } catch (error) {
      console.error('[Onboarding] Error:', error)
      toast.error('Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo size="md" showText={true} />
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Пропустить
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="text-8xl mb-8">
            {screens[currentScreen].icon}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            {screens[currentScreen].title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-400 mb-12">
            {screens[currentScreen].description}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentScreen
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Загрузка...
              </>
            ) : isLastScreen ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Начать работу
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
