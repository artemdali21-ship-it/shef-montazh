'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Shield, CheckCircle, Zap, Building2, HardHat, Wrench } from 'lucide-react'

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
  const [selectedRole, setSelectedRole] = useState('executor')

  const roles = [
    {
      id: 'customer',
      icon: '/images/building.png',
      title: 'Заказчик',
      subtitle: 'Агентство, продюсер, компания',
      initials: 'А',
    },
    {
      id: 'executor',
      icon: '/images/toolbox.png',
      title: 'Исполнитель',
      subtitle: 'Монтажник, декоратор, техник',
      initials: 'И',
    },
    {
      id: 'supervisor',
      icon: '/images/helmet-silver.png',
      title: 'Шеф-монтажник',
      subtitle: 'Бригадир, координатор',
      initials: 'Ш',
    },
  ]

  const handleRegister = () => {
    console.log('[v0] Starting registration flow')
    router.push('/register')
  }

  return (
    <div 
      className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center font-sans relative" 
      style={{ 
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* FLOATING 3D ELEMENTS - Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Carabiner - top center mobile */}
        <img
          src="/images/carabiner.png"
          alt=""
          className="absolute"
          style={{
            width: '100px',
            height: 'auto',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%) rotate(-15deg)',
            opacity: 0.6,
            animation: 'float 4s ease-in-out infinite',
          }}
        />
        {/* FLOATING TAPE 2 - Onboarding (right side, top) */}
        <img
          src="/images/tape-2.png"
          alt=""
          style={{
            position: 'fixed',
            top: '8%',
            right: '5%',
            width: '128px',
            height: 'auto',
            opacity: 0.15,
            transform: 'rotate(12deg)',
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        
        {/* Bolts - bottom right */}
        <img
          src="/images/bolts.png"
          alt=""
          className="absolute"
          style={{
            width: '80px',
            height: 'auto',
            bottom: '55%',
            right: '8%',
            transform: 'rotate(25deg)',
            opacity: 0.55,
            animation: 'float 5s ease-in-out infinite 0.5s',
          }}
        />
        
        {/* Cable coil - left middle mobile */}
        <img
          src="/images/cable-coil.png"
          alt=""
          className="absolute md:hidden"
          style={{
            width: '90px',
            height: 'auto',
            top: '65%',
            left: '5%',
            transform: 'rotate(-25deg)',
            opacity: 0.5,
            animation: 'float 4.5s ease-in-out infinite 1s',
          }}
        />
        
        {/* Chain - right bottom mobile */}
        <img
          src="/images/chain.png"
          alt=""
          className="absolute md:hidden"
          style={{
            width: '110px',
            height: 'auto',
            bottom: '12%',
            right: '5%',
            transform: 'rotate(-30deg)',
            opacity: 0.5,
            animation: 'float 6s ease-in-out infinite 0.3s',
          }}
        />
        
        {/* Wrench - left lower */}
        <img
          src="/images/wrench.png"
          alt=""
          className="absolute md:hidden"
          style={{
            width: '85px',
            height: 'auto',
            bottom: '60%',
            left: '2%',
            opacity: 0.65,
            transform: 'rotate(35deg)',
            animation: 'float 4.8s ease-in-out infinite 2s',
          }}
        />
      </div>

      {/* CSS ANIMATION */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--rotate, 0deg)); }
        }
      `}</style>

      {/* MAIN CONTENT - Centered, no container */}
      <div className="w-full max-w-sm px-6 py-12 relative z-20 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div style={{ color: '#E85D2F' }} className="flex-shrink-0">
              <AsteriskIcon />
            </div>
            <h1 style={{ color: '#1A1A1A' }} className="text-xl uppercase tracking-wider font-sans" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              ШЕФ-МОНТАЖ
            </h1>
          </div>
          <p style={{ color: '#FFFFFF' }} className="text-sm font-normal text-center tracking-tight leading-snug font-sans">
            Финтех-платформа гарантированных смен
          </p>
        </div>

        {/* HERO PHOTO CARD */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg flex-shrink-0" style={{ 
          height: '150px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          background: '#fff'
        }}>
          <img
            src="/images/img-2922.png"
            alt="Гарантированный выход бригады"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(1.05) contrast(1.05)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0 0 20px 20px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#FFFFFF' }} className="text-2xs mb-0 leading-tight font-sans" style={{ fontWeight: 700 }}>
              Надежная команда за 5 минут
            </h2>
            <p style={{ color: '#FFFFFF' }} className="text-3xs font-normal leading-tight font-sans">
              Проверенные монтажники с рейтингом и отзывами
            </p>
          </div>
        </div>

        {/* ROLE SELECTOR SECTION */}
        <div className="mb-6 flex-shrink-0">
          <h3 style={{ color: '#1A1A1A' }} className="text-lg text-center mb-3 font-sans" style={{ fontWeight: 700 }}>Кто вы?</h3>
          <div className="space-y-3">
            {roles.map((role) => {
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 text-left font-sans"
                  style={{
                    background: selectedRole === role.id 
                      ? 'rgba(255, 255, 255, 0.95)' 
                      : 'rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: selectedRole === role.id ? '2.5px solid #E85D2F' : '1.5px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: selectedRole === role.id 
                      ? '0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.6)' 
                      : '0 2px 12px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRole !== role.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRole !== role.id) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: selectedRole === role.id ? '3px solid #E85D2F' : '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: selectedRole === role.id 
                        ? '0 12px 28px rgba(232, 93, 47, 0.35)' 
                        : '0 6px 16px rgba(0,0,0,0.15)',
                      transform: selectedRole === role.id ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <img
                      src={role.icon || "/placeholder.svg"}
                      alt={role.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#1A1A1A' }} className="text-base leading-tight font-sans" style={{ fontWeight: 700 }}>
                      {role.title}
                    </div>
                    <div style={{ color: '#4A4A4A' }} className="text-sm font-normal tracking-tight leading-tight font-sans">
                      {role.subtitle}
                    </div>
                  </div>
                  {selectedRole === role.id && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E85D2F', boxShadow: '0 2px 8px rgba(232,93,47,0.4)' }}>
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full font-sans" style={{ 
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
          }}>
            <CheckCircle size={14} style={{ color: '#BFFF00' }} className="flex-shrink-0" />
            <span style={{ color: '#4A4A4A' }} className="text-sm font-medium tracking-tight">Проверка</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full font-sans" style={{ 
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
          }}>
            <Zap size={14} style={{ color: '#FFD60A' }} className="flex-shrink-0" />
            <span style={{ color: '#4A4A4A' }} className="text-sm font-medium tracking-tight">15 мин</span>
          </div>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={handleRegister}
          className="w-full text-white rounded-2xl transition-all duration-200 mb-3 flex-shrink-0 font-sans"
          style={{
            height: '56px',
            background: 'rgba(232, 93, 47, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 10px 28px rgba(232,93,47,0.3), inset 0 0 0 1px rgba(255,255,255,0.3)',
            cursor: 'pointer',
            border: 'none',
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,47,0.4), inset 0 0 0 1px rgba(255,255,255,0.4)'
            e.currentTarget.style.background = 'rgba(232, 93, 47, 0.95)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(232,93,47,0.3), inset 0 0 0 1px rgba(255,255,255,0.3)'
            e.currentTarget.style.background = 'rgba(232, 93, 47, 0.85)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(232,93,47,0.25), inset 0 0 0 1px rgba(255,255,255,0.3)'
          }}
        >
          Зарегистрироваться
        </button>

        {/* FINE PRINT */}
        <p style={{ color: '#FFFFFF' }} className="text-xs text-center tracking-tight leading-snug flex-shrink-0 font-sans">
          Вход и регистрация внутри приложения
        </p>
      </div>
    </div>
  )
}
