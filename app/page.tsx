'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useTelegram } from '@/lib/telegram'

const AsteriskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1V15M3 4L13 12M13 4L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

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

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tgUser, setTgUser] = useState<any>(null)
  const tg = useTelegram()

  useEffect(() => {
    if (tg?.user) {
      setTgUser(tg.user)
    }
  }, [tg])

  const slides = [
    {
      title: 'Найди проверенного монтажника',
      subtitle: 'Смотри рейтинг, отзывы и опыт',
      image: '/helmet333.png',
    },
    {
      title: 'Гарантия выполнения работ',
      subtitle: 'Система штрафов за срывы смен',
      image: '/helmet333.png',
    },
    {
      title: 'Быстрая оплата и поддержка',
      subtitle: 'Рассчитываемся в день завершения работ',
      image: '/helmet333.png',
    },
  ]

  const handleNext = () => {
    tg?.haptic('light')
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push('/role-select')
    }
  }

  const handleSkip = () => {
    tg?.haptic('light')
    router.push('/role-select')
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center font-sans relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] overflow-hidden">
      {/* FLOATING 3D ELEMENTS - ГЛАВНАЯ СТРАНИЦА */}
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
      <div className="w-screen h-screen flex flex-col relative z-20 overflow-y-auto" style={{ padding: 0, margin: 0 }}>
        <div className="w-full px-5 py-8 flex flex-col flex-1">
          {/* HEADER */}
          <div className="mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div style={{ color: '#E85D2F' }} className="flex-shrink-0">
              <AsteriskIcon />
            </div>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-xl uppercase tracking-wider font-sans">ШЕФ-МОНТАЖ</h1>
          </div>
          <p style={{ color: '#FFFFFF' }} className="text-sm font-normal text-center tracking-tight leading-snug font-sans">
            Финтех-платформа гарантированных смен
          </p>
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
          {/* SLIDE IMAGE */}
          <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg flex-shrink-0" style={{
            height: '200px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            backgroundColor: '#333333',
          }}>
            <img
              src={slides[currentSlide].image || "/placeholder.svg"}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(1.05) contrast(1.05)' }}
              crossOrigin="anonymous"
              onError={(e) => {
                console.log('[v0] Image failed to load:', slides[currentSlide].image)
                e.currentTarget.src = '/placeholder.svg'
              }}
              onLoad={() => {
                console.log('[v0] Image loaded successfully:', slides[currentSlide].image)
              }}
            />
          </div>

          {/* SLIDE TEXT */}
          <h2 style={{ color: '#FFFFFF', textAlign: 'right', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-4xl font-sans mb-4 leading-tight">
            {slides[currentSlide].title}
          </h2>
          <p style={{ color: '#FFFFFF' }} className="text-base font-normal leading-relaxed font-sans mb-6">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="space-y-4 flex-shrink-0">
          <button
            onClick={handleNext}
            className="w-full text-white rounded-lg transition-all duration-300 font-sans flex items-center justify-center gap-2 font-semibold h-12 hover:scale-105 active:scale-95"
            style={{
              background: '#E85D2F',
              boxShadow: '0 6px 20px rgba(232, 93, 47, 0.3)',
              cursor: 'pointer',
              border: 'none',
              fontSize: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D04D1F'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E85D2F'
            }}
          >
            {currentSlide === slides.length - 1 ? 'Начать' : 'Далее'}
            {currentSlide < slides.length - 1 && <ChevronRight size={20} strokeWidth={2} />}
          </button>

          {currentSlide > 0 && (
            <button
              onClick={handleSkip}
              className="w-full rounded-lg transition-all duration-300 font-sans font-semibold h-12"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Пропустить
            </button>
          )}
        </div>

        {/* FINE PRINT */}
        <p style={{ color: '#FFFFFF' }} className="text-sm text-center leading-relaxed mt-8 flex-shrink-0 font-sans font-medium">
          Вход и регистрация внутри приложения
        </p>
      </div>
    </div>
  )
}
