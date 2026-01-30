'use client'

import { X, CheckCircle, Clock, Calendar, MapPin, Wallet, Bell, Search, FileText } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'

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
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col overflow-hidden">
      <Header 
        title="Подтверждение отклика" 
        showBack={true} 
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-y-scroll px-4 pt-6 pb-24" data-allow-scroll>
        {/* HELMET IMAGE */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
          <img
            src="/helmet-single.png"
            alt="Шеф-монтаж каска"
            style={{ width: '320px', height: '320px', objectFit: 'contain', opacity: 0.95 }}
          />
        </div>

        {/* SUCCESS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 20px 12px 20px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(191, 255, 0, 0.15)', border: '3px solid #BFFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', animation: 'pulse 2s ease-in-out infinite' }}>
            <CheckCircle size={48} color="#BFFF00" strokeWidth={2} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>Отклик отправлен</h1>
          <p style={{ fontSize: '14px', color: '#FFFFFF', opacity: 0.7, marginBottom: '20px' }}>Заказчик получил вашу заявку и рассмотрит её</p>

          {/* JOB INFO CARDS */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {jobInfo.map((info) => {
              const Icon = info.icon
              return (
                <div key={info.label} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <Icon size={20} color="#E85D2F" style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '11px', color: '#FFFFFF', opacity: 0.6, marginBottom: '2px' }}>{info.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{info.value}</p>
                </div>
              )
            })}
          </div>

          {/* TIMELINE */}
          <div style={{ width: '100%', marginBottom: '20px' }}>
            {timelineSteps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === timelineSteps.length - 1

              const getStepStyle = () => {
                if (step.status === 'completed') {
                  return { background: 'rgba(191, 255, 0, 0.15)', border: '2px solid #BFFF00' }
                } else if (step.status === 'active') {
                  return { background: 'rgba(232, 93, 47, 0.15)', border: '2px solid #E85D2F', animation: 'pulse 2s ease-in-out infinite' }
                } else {
                  return { background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.15)' }
                }
              }

              const getIconColor = () => {
                if (step.status === 'completed') return '#BFFF00'
                if (step.status === 'active') return '#E85D2F'
                return '#FFFFFF'
              }

              return (
                <div key={step.id} style={{ display: 'flex', gap: '14px', marginBottom: isLast ? '0' : '14px', position: 'relative' }}>
                  {!isLast && (
                    <div style={{ position: 'absolute', left: '27px', top: '56px', width: '2px', height: 'calc(100% + 14px)', background: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ ...getStepStyle(), width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color={getIconColor()} strokeWidth={2} />
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingTop: '6px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>{step.title}</p>
                    <p style={{ fontSize: '12px', color: '#FFFFFF', opacity: 0.6 }}>{step.description}</p>
                    {step.time && (
                      <p style={{ fontSize: '11px', color: step.status === 'active' ? '#E85D2F' : '#BFFF00', marginTop: '4px' }}>{step.time}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* BUTTONS */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => router.push('/shifts')}
              onMouseEnter={() => setHoveredButton('shifts')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#E85D2F',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: hoveredButton === 'shifts' ? 0.9 : 1,
                transform: hoveredButton === 'shifts' ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              Смотреть другие смены
            </button>
            <button
              onClick={() => router.push('/applications')}
              onMouseEnter={() => setHoveredButton('applications')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'transparent',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: hoveredButton === 'applications' ? 0.8 : 1,
              }}
            >
              Мои отклики
            </button>
          </div>
        </div>
      </div>

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
  )
}
