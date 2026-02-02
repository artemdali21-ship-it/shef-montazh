'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface InitialOnboardingProps {
  onComplete: () => void
}

export default function InitialOnboarding({ onComplete }: InitialOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: 'Найдите работу быстро',
      subtitle: 'Просматривайте доступные смены и откликайтесь на подходящие вакансии',
      image: '/helmet333.png',
      emoji: '🔍',
    },
    {
      title: 'Гарантия выполнения работ',
      subtitle: 'Система штрафов за срывы смен',
      image: '/helmet333.png',
      emoji: '💰',
    },
    {
      title: 'Поддержка 24/7',
      subtitle: 'Рассчитываемся в день завершения работ. Скоро подключим ИИ-помощника!',
      image: '/helmet333.png',
      emoji: '🤖',
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center font-sans relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] overflow-hidden">
      {/* FLOATING 3D ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/carabiner.png"
          alt=""
          style={{
            position: 'fixed',
            top: '8%',
            right: '5%',
            width: '140px',
            height: 'auto',
            opacity: 0.65,
            transform: 'rotate(12deg)',
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <img
          src="/images/bolts.png"
          alt=""
          className="absolute"
          style={{
            width: '90px',
            height: 'auto',
            bottom: '30%',
            left: '5%',
            transform: 'rotate(20deg)',
            opacity: 0.55,
            zIndex: 5,
            animation: 'float 6s ease-in-out infinite 1s',
            filter: 'drop-shadow(0 4px 12px rgba(255, 214, 10, 0.25))',
          }}
        />
        <img
          src="/images/chain.png"
          alt=""
          className="absolute"
          style={{
            width: '130px',
            height: 'auto',
            bottom: '5%',
            right: '8%',
            transform: 'rotate(25deg)',
            opacity: 0.7,
            zIndex: 0,
            animation: 'float 7s ease-in-out infinite 0.5s',
            filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.3))',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--rotate, 0deg)); }
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div className="w-screen h-screen flex flex-col relative z-20 overflow-y-auto p-0 m-0">
        <div className="w-full px-5 py-8 flex flex-col flex-1">
          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              <Logo size="lg" showText={true} />
            </div>
            {currentSlide > 0 && (
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Пропустить
              </button>
            )}
          </div>

          {/* SLIDE COUNTER */}
          <div className="flex justify-center gap-1 mb-6 flex-shrink-0">
            {slides.map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: '4px',
                  flex: 1,
                  borderRadius: '2px',
                  background: idx === currentSlide ? '#E85D2F' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* SLIDE CONTENT */}
          <div className="mb-8 flex-1 flex flex-col justify-center">
            {/* EMOJI/ICON */}
            <div className="text-8xl text-center mb-6">
              {slides[currentSlide].emoji}
            </div>

            {/* SLIDE TEXT */}
            <h2 className="text-4xl font-extrabold text-white text-center mb-4 leading-tight tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-base text-gray-300 text-center leading-relaxed mb-6 px-4">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* BUTTON */}
          <div className="flex-shrink-0">
            <button
              onClick={handleNext}
              className="w-full text-white rounded-lg transition-all duration-300 font-sans flex items-center justify-center gap-2 font-semibold h-12 hover:scale-105 active:scale-95"
              style={{
                background: '#E85D2F',
                boxShadow: '0 6px 20px rgba(232, 93, 47, 0.3)',
                border: 'none',
                fontSize: '16px',
              }}
            >
              {currentSlide === slides.length - 1 ? 'Начать' : 'Далее'}
              {currentSlide < slides.length - 1 && <ChevronRight size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
