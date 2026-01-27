'use client'

import { X, CheckCircle, Clock, Calendar, MapPin, Wallet, Bell, Search, FileText } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export default function ApplicationConfirmationScreen() {
  const router = useRouter()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const jobInfo = [
    { icon: Calendar, label: 'Дата', value: '28 января' },
    { icon: Clock, label: 'Время', value: '18:00 - 02:00' },
    { icon: MapPin, label: 'Локация', value: 'Крокус Экспо' },
    { icon: Wallet, label: 'Ставка', value: '2 500 ₽' },
  ]

  const timelineSteps = [
    {
      id: 1,
      status: 'completed',
      icon: CheckCircle,
      title: 'Отклик отправлен',
      description: 'Заказчик получил вашу заявку',
      time: 'Только что',
    },
    {
      id: 2,
      status: 'active',
      icon: Clock,
      title: 'Ожидание подтверждения',
      description: 'Обычно занимает до 2 часов',
      time: 'В процессе',
    },
    {
      id: 3,
      status: 'pending',
      icon: Bell,
      title: 'Уведомление при одобрении',
      description: 'Вы получите push с деталями',
      time: null,
    },
  ]

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
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
      {/* HEADER */}
      <Header 
        title="Подтверждение отклика" 
        showBack={true} 
        onBack={() => router.back()}
      />
      {/* FLOATING TAPE 3 - Job Details (vertical) */}
      <img
        src="/images/tape-3.png"
        alt=""
        style={{
          position: 'fixed',
          left: '2%',
          top: '50%',
          width: '112px',
          height: 'auto',
          opacity: 0.12,
          transform: 'translateY(-50%) rotate(90deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* FLOATING CONCRETE MAIN - Job Details */}
      <img
        src="/images/concrete-main.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '5%',
          width: '88px',
          height: 'auto',
          opacity: 0.09,
          transform: 'rotate(14deg)',
          zIndex: 1,
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
            justifyContent: 'space-between',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: '#E85D2F' }} className="text-xl font-bold">
              *
            </span>
            <h1 className="text-lg font-bold text-white font-sans">ШЕФ-МОНТАЖ</h1>
          </div>
          <button
            onClick={() => router.push('/feed')}
            className="flex items-center justify-center transition-all duration-200"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <X size={20} color="#FFFFFF" />
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pt-12 pb-56 px-5 font-sans">
          {/* HELMET IMAGE */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0px',
              paddingTop: '0px',
            }}
          >
            <img
              src="/helmet-single.png"
              alt="Шеф-монтаж каска"
              style={{
                width: '320px',
                height: '320px',
                objectFit: 'contain',
                opacity: 0.95,
              }}
            />
          </div>

          {/* SUCCESS HERO SECTION */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '8px 20px 12px 20px',
              marginLeft: '-20px',
              marginRight: '-20px',
            }}
          >
            {/* Success Icon */}
            <div
              className="flex items-center justify-center mb-2"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'rgba(191, 255, 0, 0.15)',
                border: '3px solid #BFFF00',
                boxShadow: '0 8px 32px rgba(191, 255, 0, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <CheckCircle size={56} color="#BFFF00" strokeWidth={2.5} />
            </div>

            {/* Success Headline */}
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: '28px',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
                lineHeight: '1.2',
                marginBottom: '6px',
              }}
            >
              Отклик отправлен!
            </h1>

            {/* Success Subtext */}
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                color: '#FFFFFF',
                lineHeight: '1.6',
                maxWidth: '300px',
              }}
            >
              Заказчик получил вашу заявку. Ожидайте подтверждения.
            </p>
          </div>

          {/* JOB SUMMARY CARD */}
          <div style={{ padding: '0 0 16px 0', marginBottom: '16px' }}>
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#E85D2F',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  ЗАЯВКА НА СМЕНУ
                </span>
                <span
                  style={{
                    background: 'rgba(191, 255, 0, 0.15)',
                    border: '1px solid #BFFF00',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '10px',
                    color: '#BFFF00',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  АКТИВНА
                </span>
              </div>

              {/* Job Title */}
              <h2
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#FFFFFF',
                  lineHeight: '1.3',
                  marginBottom: '16px',
                }}
              >
                Монтаж выставочного стенда
              </h2>

              {/* Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                {jobInfo.map((item, idx) => {
                  const IconComponent = item.icon
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <IconComponent size={18} color="#E85D2F" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 500,
                            fontSize: '11px',
                            color: '#6B6B6B',
                            marginBottom: '2px',
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#FFFFFF',
                            lineHeight: '1.3',
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TIMELINE SECTION */}
          <div style={{ padding: '0 0 16px 0' }}>
            <h3
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '12px',
              }}
            >
              Что дальше?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {timelineSteps.map((step, idx) => {
                const IconComponent = step.icon
                const isLast = idx === timelineSteps.length - 1

                const getIconStyles = () => {
                  if (step.status === 'completed') {
                    return {
                      background: 'rgba(191, 255, 0, 0.15)',
                      border: '2px solid #BFFF00',
                    }
                  } else if (step.status === 'active') {
                    return {
                      background: 'rgba(232, 93, 47, 0.15)',
                      border: '2px solid #E85D2F',
                      animation: 'pulse 2s ease-in-out infinite',
                    }
                  } else {
                    return {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                    }
                  }
                }

                const getIconColor = () => {
                  if (step.status === 'completed') return '#BFFF00'
                  if (step.status === 'active') return '#E85D2F'
                  return '#FFFFFF'
                }

                const getTitleColor = () => {
                  return '#FFFFFF'
                }

                return (
                  <div key={step.id} style={{ display: 'flex', gap: '14px', marginBottom: isLast ? '0' : '14px', position: 'relative' }}>
                    {/* Connector Line */}
                    {!isLast && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '19px',
                          top: '38px',
                          width: '2px',
                          height: '28px',
                          background: 'rgba(255, 255, 255, 0.15)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        ...getIconStyles(),
                      }}
                    >
                      <IconComponent size={20} color={getIconColor()} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h4
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 600,
                            fontSize: '15px',
                            color: getTitleColor(),
                          }}
                        >
                          {step.title}
                        </h4>
                        {step.time && (
                          <span
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: '#FFFFFF',
                              padding: '6px 12px',
                              background: step.time === 'Только что' ? 'rgba(191, 255, 0, 0.2)' : 'rgba(232, 93, 47, 0.2)',
                              border: step.time === 'Только что' ? '1px solid rgba(191, 255, 0, 0.4)' : '1px solid rgba(232, 93, 47, 0.4)',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {step.time}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 400,
                          fontSize: '13px',
                          color: '#FFFFFF',
                          lineHeight: '1.5',
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'transparent',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Primary Button */}
            <button
              onClick={() => router.push('/feed')}
              onMouseEnter={() => setHoveredButton('primary')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '100%',
                height: '52px',
                background: hoveredButton === 'primary' ? '#D04D1F' : '#E85D2F',
                border: 'none',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                color: '#FFFFFF',
                letterSpacing: '0.3px',
                cursor: 'pointer',
                boxShadow: hoveredButton === 'primary' ? '0 8px 24px rgba(232, 93, 47, 0.5)' : '0 6px 20px rgba(232, 93, 47, 0.4)',
                transform: hoveredButton === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={20} strokeWidth={2.5} />
              Вернуться к поиску
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => router.push('/applications')}
              onMouseEnter={() => setHoveredButton('secondary')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '100%',
                height: '52px',
                background: hoveredButton === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: hoveredButton === 'secondary' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                color: '#FFFFFF',
                letterSpacing: '0.3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FileText size={20} strokeWidth={2.5} />
              Мои отклики
            </button>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <BottomNav userType="worker" />

        {/* PULSE ANIMATION */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
