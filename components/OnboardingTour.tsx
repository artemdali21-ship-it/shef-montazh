'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface TourStep {
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface OnboardingTourProps {
  role: 'worker' | 'client'
  onComplete: () => void
  onSkip: () => void
}

const WORKER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Добро пожаловать!',
    description: 'Давайте покажем как найти работу и заработать на платформе ШЕФ-МОНТАЖ'
  },
  {
    title: 'Ваш профиль',
    description: 'Здесь вы можете добавить навыки, опыт и документы. Заполненный профиль повышает шансы получить смену.',
    targetSelector: '[data-tour="worker-profile"]'
  },
  {
    title: 'Поиск смен',
    description: 'Просматривайте доступные смены, фильтруйте по дате, локации и оплате. Откликайтесь на подходящие.',
    targetSelector: '[data-tour="shifts-list"]'
  },
  {
    title: 'Откликнуться на смену',
    description: 'Нажмите "Откликнуться" на интересную смену. Клиент увидит ваш профиль и примет решение.',
    targetSelector: '[data-tour="apply-button"]'
  },
  {
    title: 'Check-in на смене',
    description: 'Когда придете на объект, отметьтесь через приложение. Это подтвердит ваше присутствие.',
    targetSelector: '[data-tour="checkin-button"]'
  },
  {
    title: 'Получите деньги',
    description: 'После завершения смены деньги поступят на ваш счет в течение 24 часов. Никаких задержек!',
    targetSelector: '[data-tour="balance"]'
  }
]

const CLIENT_TOUR_STEPS: TourStep[] = [
  {
    title: 'Добро пожаловать!',
    description: 'Давайте покажем как быстро найти надежную бригаду для вашего мероприятия'
  },
  {
    title: 'Создание смены',
    description: 'Опишите работу: дата, время, локация, требования. Укажите оплату и количество монтажников.',
    targetSelector: '[data-tour="create-shift"]'
  },
  {
    title: 'Отклики воркеров',
    description: 'Получайте отклики от воркеров. Смотрите их рейтинг, опыт, отзывы. Выбирайте лучших.',
    targetSelector: '[data-tour="applications"]'
  },
  {
    title: 'Одобрение заявок',
    description: 'Одобрите подходящих воркеров. Они получат уведомление и подтвердят участие.',
    targetSelector: '[data-tour="approve-button"]'
  },
  {
    title: 'Мониторинг работы',
    description: 'Отслеживайте check-in/check-out воркеров в реальном времени. Будьте в курсе происходящего.',
    targetSelector: '[data-tour="monitoring"]'
  },
  {
    title: 'Оплата и рейтинг',
    description: 'После смены оплатите работу и оставьте рейтинг. Воркеры с хорошими отзывами получают больше работы.',
    targetSelector: '[data-tour="payment"]'
  }
]

export function OnboardingTour({ role, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const steps = role === 'worker' ? WORKER_TOUR_STEPS : CLIENT_TOUR_STEPS
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem(`onboarding_${role}_completed`)
    if (!hasCompleted) {
      setIsVisible(true)
    }
  }, [role])

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`onboarding_${role}_completed`, 'true')
    setIsVisible(false)
    onComplete()
  }

  const handleSkipTour = () => {
    localStorage.setItem(`onboarding_${role}_completed`, 'true')
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Шаг {currentStep + 1} из {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkipTour}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{step.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkipTour}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Пропустить
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                {isLastStep ? 'Готово' : 'Далее'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Don't show again checkbox */}
          {currentStep === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem(`onboarding_${role}_never_show`, 'true')
                    } else {
                      localStorage.removeItem(`onboarding_${role}_never_show`)
                    }
                  }}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                Больше не показывать
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Reset onboarding tour (for testing or user request)
 */
export function resetOnboardingTour(role: 'worker' | 'client') {
  localStorage.removeItem(`onboarding_${role}_completed`)
  localStorage.removeItem(`onboarding_${role}_never_show`)
}

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(role: 'worker' | 'client'): boolean {
  const completed = localStorage.getItem(`onboarding_${role}_completed`)
  const neverShow = localStorage.getItem(`onboarding_${role}_never_show`)
  return !completed && !neverShow
}
