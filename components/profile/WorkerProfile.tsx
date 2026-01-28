'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  User,
  CheckCircle,
  Briefcase,
  Star,
  Shield,
  Circle,
  FileText,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { GosuslugiButton } from '../verification/GosuslugiButton'
import { getWorkerProfile, getWorkerShiftHistory, getWorkerRatings } from '@/lib/api/profiles'

export default function WorkerProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [userProfile, setUserProfile] = useState<any>(null)
  const [workHistory, setWorkHistory] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [isGosuslugiVerified, setIsGosuslugiVerified] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true)
        setError(null)
        
        // TODO: Get actual user ID from auth
        const userId = 'mock-user-id'
        
        // Load profile
        const { data: profileData, error: profileError } = await getWorkerProfile(userId)
        if (profileError) throw profileError
        
        // Load shift history
        const { data: historyData, error: historyError } = await getWorkerShiftHistory(userId)
        if (historyError) throw historyError
        
        // Load ratings
        const { data: ratingsData, error: ratingsError } = await getWorkerRatings(userId)
        if (ratingsError) throw ratingsError
        
        setUserProfile(profileData)
        setWorkHistory(historyData || [])
        setRatings(ratingsData || [])
        
        // Set selected skills from profile
        if (profileData?.profile?.categories) {
          setSelectedSkills(new Set(profileData.profile.categories))
        }
        
        setIsGosuslugiVerified(profileData?.gosuslugi_verified || false)
        
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Не удалось загрузить профиль')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const toggleSkill = (skillName: string) => {
    const newSelected = new Set(selectedSkills)
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName)
    } else {
      newSelected.add(skillName)
    }
    setSelectedSkills(newSelected)
  }

  // Calculate stats from ratings
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0'
  
  const completedShifts = workHistory.length
  const reliability = completedShifts > 0 
    ? Math.round((completedShifts / (completedShifts + 2)) * 100) // Mock calculation
    : 0

  const availableSkills = [
    'Монтаж',
    'Декоратор',
    'Альпинист',
    'Электрик',
    'Сварщик',
    'Бутафор',
    'Разнорабочий'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-white text-lg">Загрузка профиля...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
        position: 'relative',
      }}
    >
      {/* DECORATIVE ELEMENTS */}
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
          <h1
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: '#FFFFFF',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Профиль
          </h1>

          <button
            onClick={() => router.push('/settings')}
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
            <Settings size={20} color="#FFFFFF" />
          </button>
        </header>

        {/* CONTENT */}
        <div style={{ paddingTop: '64px', paddingBottom: '100px', overflowY: 'auto' }}>
          {/* USER INFO CARD */}
          <div style={{ padding: '20px' }}>
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                  border: isGosuslugiVerified ? '3px solid #BFFF00' : '3px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <User size={40} color="white" />
              </div>

              {/* Name */}
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {userProfile?.full_name || 'Загрузка...'}
              </h2>

              {/* ID */}
              <p
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#6B6B6B',
                  marginBottom: '16px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                ID: {userProfile?.id?.substring(0, 8).toUpperCase() || '---'}
              </p>

              {/* Verification Button */}
              <GosuslugiButton
                isVerified={isGosuslugiVerified}
                onVerify={() => {
                  console.log('Start Gosuslugi verification')
                  setIsGosuslugiVerified(true)
                }}
              />
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Completed Shifts */}
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <Briefcase size={24} color="#E85D2F" style={{ margin: '0 auto 8px' }} />
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#FFFFFF',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {completedShifts}
              </div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '11px',
                  color: '#6B6B6B',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Смен
              </div>
            </div>

            {/* Rating */}
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <Star size={24} color="#BFFF00" style={{ margin: '0 auto 8px' }} />
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#BFFF00',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {averageRating}
              </div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '11px',
                  color: '#6B6B6B',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Рейтинг
              </div>
            </div>

            {/* Reliability */}
            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <Shield size={24} color="#4ADE80" style={{ margin: '0 auto 8px' }} />
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#4ADE80',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {reliability}%
              </div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '11px',
                  color: '#6B6B6B',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Надежность
              </div>
            </div>
          </div>

          {/* SKILLS SECTION */}
          <div style={{ padding: '0 20px 20px' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Навыки и специализации
            </h3>

            <div
              style={{
                background: 'rgba(245, 245, 245, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.has(skill)
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '20px',
                        background: isSelected ? '#E85D2F' : 'rgba(255, 255, 255, 0.1)',
                        border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                        color: isSelected ? '#FFFFFF' : '#FFFFFF',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Montserrat', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Circle size={16} />
                      )}
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* WORK HISTORY */}
          <div style={{ padding: '0 20px 20px' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              История работ
            </h3>

            {workHistory.length === 0 ? (
              <div
                style={{
                  background: 'rgba(245, 245, 245, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: '#6B6B6B', fontSize: '14px' }}>
                  История работ пока пуста
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {workHistory.slice(0, 3).map((work, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(245, 245, 245, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#FFFFFF',
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {work.shift?.title || 'Смена'}
                      </h4>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            color={i < (work.rating || 5) ? '#BFFF00' : '#444'}
                            fill={i < (work.rating || 5) ? '#BFFF00' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p
                      style={{
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#6B6B6B',
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {work.shift?.location_address || 'Локация не указана'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DOCUMENTS */}
          <div style={{ padding: '0 20px 20px' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Документы и выплаты
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Employment Status */}
              <div
                style={{
                  background: 'rgba(245, 245, 245, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <FileText size={20} color="#E85D2F" />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B6B6B',
                      marginBottom: '4px',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Статус занятости
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {userProfile?.profile?.status || 'Не указан'}
                  </p>
                </div>
                <CheckCircle size={20} color="#4ADE80" />
              </div>

              {/* Payment Method */}
              <div
                style={{
                  background: 'rgba(245, 245, 245, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CreditCard size={20} color="#E85D2F" />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B6B6B',
                      marginBottom: '4px',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Способ выплаты
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    •••• 4729
                  </p>
                </div>
                <CheckCircle size={20} color="#4ADE80" />
              </div>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <div style={{ padding: '0 20px' }}>
            <button
              onClick={() => {
                console.log('Logout')
                router.push('/login')
              }}
              style={{
                width: '100%',
                height: '52px',
                background: 'rgba(255, 59, 48, 0.15)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '15px',
                color: '#FF3B30',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <LogOut size={20} />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
