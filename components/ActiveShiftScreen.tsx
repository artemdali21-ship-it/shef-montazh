'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  HelpCircle,
  Clock,
  Wallet,
  Camera,
  MapPin,
  CheckCircle,
  User,
  Phone,
  MessageCircle,
  AlertTriangle,
  ChevronRight,
  CheckSquare,
} from 'lucide-react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export default function ActiveShiftScreen() {
  const router = useRouter()
  const [shiftState, setShiftState] = useState({
    status: 'on_site',
    checkInTime: new Date('2026-01-27T18:00:00'),
    elapsedSeconds: 13335,
    hourlyRate: 312.5,
    checkInPhotoUrl: null,
    shefContact: {
      name: 'Игорь Петров',
      phone: '+7 916 123 45 67',
      chatId: 'chat_123',
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setShiftState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const earnings = Math.floor((shiftState.hourlyRate / 3600) * shiftState.elapsedSeconds)

  const checkInRequirements = [
    'Включите геолокацию на телефоне',
    'Фото должно быть сделано сейчас',
    'Убедитесь, что вы на объекте',
  ]

  const jobDetails = [
    { icon: 'MapPin', label: 'Локация', value: 'Крокус Экспо, павильон 3' },
    { icon: 'Clock', label: 'Время', value: '18:00 - 02:00 (8 часов)' },
    { icon: 'User', label: 'Шеф-монтажник', value: 'Игорь Петров' },
  ]

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MapPin':
        return <MapPin size={20} color="#E85D2F" />
      case 'Clock':
        return <Clock size={20} color="#E85D2F" />
      case 'User':
        return <User size={20} color="#E85D2F" />
      default:
        return null
    }
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-gradient.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: 'Montserrat, system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* FLOATING DRILL - Active Shift (LARGEST - closest) */}
      <img
        src="/images/drill.png"
        alt=""
        style={{
          position: 'fixed',
          top: '8%',
          right: '4%',
          width: '128px',
          height: 'auto',
          opacity: 0.18,
          transform: 'rotate(25deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* FLOATING CONCRETE 5 - Active Shift */}
      <img
        src="/images/concrete-5.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '15%',
          left: '3%',
          width: '80px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(-10deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* HEADER */}
        <header
          className="fixed top-0 left-0 right-0 z-50 border-b"
          style={{
            background: 'transparent',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.22 ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </button>

          <h1
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: '#FFFFFF',
              fontFamily: "'Montserrat', sans-serif",
              flex: 1,
              textAlign: 'center',
            }}
          >
            Активная смена
          </h1>

          <button
            onClick={() => console.log('Open help')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={20} color="#FFFFFF" />
          </button>
        </header>

        {/* CONTENT */}
        <div style={{ paddingTop: '64px', paddingBottom: '160px' }}>
          {/* STATUS BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #BFFF00 0%, #A8E600 100%)',
              padding: '20px',
              borderRadius: '0 0 24px 24px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(191, 255, 0, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#1A1A1A',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                СТАТУС СМЕНЫ
              </p>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#1A1A1A',
                  letterSpacing: '-0.3px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                На объекте
              </p>
            </div>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#1A1A1A',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* TIMER & EARNINGS CARD */}
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
            >
              {/* Timer */}
              <div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(232, 93, 47, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Clock size={18} color="#E85D2F" />
                </div>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B6B6B',
                    marginBottom: '9px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  ВРЕМЯ НА СМЕНЕ
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '28px',
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {formatTime(shiftState.elapsedSeconds)}
                </p>
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: '11px',
                    color: '#FFFFFF',
                    marginTop: '4px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  из 8 часов
                </p>
              </div>

              {/* Earnings */}
              <div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(191, 255, 0, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Wallet size={18} color="#BFFF00" />
                </div>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B6B6B',
                    marginBottom: '8px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  ЗАРАБОТАНО
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '28px',
                    color: '#BFFF00',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {earnings} ₽
                </p>
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: '11px',
                    color: '#FFFFFF',
                    marginTop: '4px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  2 500 ₽ за смену
                </p>
              </div>
            </div>
          </div>

          {/* CHECK-IN SECTION */}
          {!shiftState.checkInPhotoUrl && (
            <div style={{ padding: '0 20px', marginBottom: '20px' }}>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#FFFFFF',
                  marginBottom: '14px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Подтвердите выход на объект
              </h2>

              <div
                style={{
                  background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(232, 93, 47, 0.3)',
                }}
              >
                {/* Icons row */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <Camera size={24} color="white" />
                  <MapPin size={24} color="white" />
                  <Clock size={24} color="white" />
                </div>

                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    color: 'white',
                    marginBottom: '10px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Загрузите фото объекта
                </h3>

                <p
                  style={{
                    fontWeight: 400,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Сделайте фото рабочей зоны. Система автоматически проверит геопозицию и время.
                </p>

                {/* Requirements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {checkInRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      <CheckCircle size={16} color="white" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>

                {/* Upload button */}
                <button
                  onClick={() => console.log('Open camera for check-in')}
                  style={{
                    width: '100%',
                    height: '52px',
                    background: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#E85D2F',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Camera size={20} strokeWidth={2.5} />
                  Загрузить фото
                </button>
              </div>
            </div>
          )}

          {/* JOB INFO CARD */}
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Детали смены
            </h2>

            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#FFFFFF',
                  marginBottom: '16px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Монтаж выставочного стенда
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {jobDetails.map((detail, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '2px' }}>{getIconComponent(detail.icon)}</div>
                    <div>
                      <p
                        style={{
                          fontWeight: 500,
                          fontSize: '11px',
                          color: '#6B6B6B',
                          marginBottom: '2px',
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {detail.label}
                      </p>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#FFFFFF',
                          lineHeight: 1.4,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT SECTION */}
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Связь
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {/* Call button */}
              <button
                onClick={() => console.log('Call шеф-монтажник')}
                style={{
                  height: '56px',
                  background: 'rgba(191, 255, 0, 0.15)',
                  border: '1px solid #BFFF00',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(191, 255, 0, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(191, 255, 0, 0.15)'
                }}
              >
                <Phone size={20} color="#BFFF00" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#BFFF00',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Позвонить
                </span>
              </button>

              {/* Message button */}
              <button
                onClick={() => console.log('Message шеф-монтажник')}
                style={{
                  height: '56px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <MessageCircle size={20} color="#FFFFFF" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Написать
                </span>
              </button>
            </div>
          </div>

          {/* EMERGENCY SECTION */}
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Проблемы на смене?
            </h2>

            <button
              onClick={() => console.log('Open problem report')}
              style={{
                width: '100%',
                background: 'rgba(255, 214, 10, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 214, 10, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 214, 10, 0.15)'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 214, 10, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} color="#FFD60A" />
              </div>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    marginBottom: '4px',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Сообщить о проблеме
                </p>
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#FFFFFF',
                    lineHeight: 1.4,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Техника безопасности, брак материала
                </p>
              </div>

              <ChevronRight size={20} color="#FFFFFF" />
            </button>
          </div>
        </div>

        {/* COMPLETE SHIFT BUTTON */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'transparent',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px 20px 28px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => console.log('Complete shift')}
            style={{
              width: '100%',
              height: '52px',
              background: '#E85D2F',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: 700,
              fontSize: '15px',
              color: 'white',
              letterSpacing: '0.3px',
              boxShadow: '0 6px 20px rgba(232, 93, 47, 0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Montserrat', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D04D1F'
              e.currentTarget.style.transform = 'scale(0.98)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E85D2F'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <CheckSquare size={20} strokeWidth={2.5} />
            Завершить смену
          </button>

          <p
            style={{
              fontWeight: 400,
              fontSize: '11px',
              color: '#9B9B9B',
              textAlign: 'center',
              marginTop: '10px',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Шеф-монтажник должен подтвердить завершение работ
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
