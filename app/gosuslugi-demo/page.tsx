'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GosuslugiButton } from '@/components/verification/GosuslugiButton'
import { UserProfileCard } from '@/components/UserProfileCard'

export default function GosuslugiDemoPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  const mockWorkers = [
    {
      id: 1,
      name: 'Иван Петров',
      specialization: 'Монтажник',
      rating: 4.9,
      completedJobs: 47,
      location: 'Москва',
      isGosuslugiVerified: true,
    },
    {
      id: 2,
      name: 'Сергей Смирнов',
      specialization: 'Электрик',
      rating: 4.7,
      completedJobs: 32,
      location: 'Санкт-Петербург',
      isGosuslugiVerified: false,
    },
    {
      id: 3,
      name: 'Алексей Новиков',
      specialization: 'Сварщик',
      rating: 5.0,
      completedJobs: 65,
      location: 'Казань',
      isGosuslugiVerified: true,
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
        position: 'relative',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10,
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
            transition: 'all 0.2s ease',
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
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            color: '#FFFFFF',
          }}
        >
          Госуслуги Верификация
        </h1>

        <div style={{ width: '40px' }} />
      </header>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: '64px',
          paddingBottom: '20px',
          minHeight: '100vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ padding: '20px' }}>
          {/* Section 1: Unverified Button */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
              Кнопка верификации (Unverified)
            </h2>
            <GosuslugiButton isVerified={isVerified} onVerify={() => setIsVerified(true)} />
          </div>

          {/* Section 2: Verified Badge */}
          {isVerified && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                После верификации:
              </h2>
              <GosuslugiButton isVerified={true} onVerify={() => {}} />
            </div>
          )}

          {/* Section 3: Compact Mode */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
              Компактный режим (для карточек)
            </h2>
            <GosuslugiButton
              isVerified={isVerified}
              onVerify={() => setIsVerified(true)}
              compact={true}
            />
          </div>

          {/* Section 4: User Cards with Verification Badge */}
          <div>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
              Карточки пользователей с Госуслуги верификацией
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockWorkers.map((worker) => (
                <UserProfileCard
                  key={worker.id}
                  name={worker.name}
                  specialization={worker.specialization}
                  rating={worker.rating}
                  completedJobs={worker.completedJobs}
                  location={worker.location}
                  isGosuslugiVerified={worker.isGosuslugiVerified}
                  onClick={() => console.log(`Clicked ${worker.name}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
