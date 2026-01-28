'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  User,
  CheckCircle,
  Briefcase,
  Star,
  Shield,
  AlertCircle,
  ExternalLink,
  Circle,
  FileText,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { Header } from '../Header'
import { GosuslugiButton } from '../verification/GosuslugiButton'

const userProfile = {
  id: 'NM-47821',
  name: 'Никита Соколов',
  avatar: null,
  verified: false,
  stats: {
    shiftsCompleted: 47,
    rating: 4.9,
    reliability: 98,
  },
  skills: [
    { name: 'Монтаж', verified: true },
    { name: 'Декоратор', verified: true },
    { name: 'Альпинист', verified: false },
    { name: 'Электрик', verified: false },
    { name: 'Сварщик', verified: true },
  ],
  employmentStatus: 'Самозанятый',
  paymentMethod: {
    type: 'card',
    last4: '4729',
    verified: true,
  },
}

const workHistory = [
  {
    title: 'Монтаж выставочного стенда',
    company: 'Decor Factory',
    date: '24 января 2026',
    payment: '2 500 ₽',
    status: 'completed',
    rating: 5,
  },
  {
    title: 'Сборка декораций для концерта',
    company: 'Event Pro',
    date: '20 января 2026',
    payment: '3 200 ₽',
    status: 'completed',
    rating: 5,
  },
  {
    title: 'Демонтаж после выставки',
    company: 'Expo Global',
    date: '18 января 2026',
    payment: '1 800 ₽',
    status: 'completed',
    rating: 4,
  },
]

const documents = [
  {
    icon: FileText,
    title: 'Статус занятости',
    value: 'Самозанятый',
    verified: true,
    action: 'Изменить',
  },
  {
    icon: CreditCard,
    title: 'Способ выплаты',
    value: '•••• 4729',
    verified: true,
    action: 'Изменить',
  },
]

export default function WorkerProfile() {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(userProfile.skills.filter((s) => s.verified).map((s) => s.name))
  )
  const [isGosuslugiVerified, setIsGosuslugiVerified] = useState(false)

  const toggleSkill = (skillName: string) => {
    const newSelected = new Set(selectedSkills)
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName)
    } else {
      newSelected.add(skillName)
    }
    setSelectedSkills(newSelected)
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* DECORATIVE ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <img src="/images/tape-2.png" className="absolute top-10 left-1/4 w-16 h-16" alt="" />
      </div>

      {/* HEADER */}
      <header
        className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-5 z-10"
        style={{
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>

        <h1 className="text-base font-bold text-white">Профиль</h1>

        <button
          onClick={() => console.log('Open settings')}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <Settings size={18} color="#FFFFFF" />
        </button>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pt-16 pb-24 relative z-20">
        {/* HELMET DECORATION */}
        <img
          src="/images/helmet.png"
          alt=""
          className="fixed bottom-1/4 left-5 w-36 opacity-60 pointer-events-none"
          style={{
            transform: 'rotate(-15deg)',
            animation: 'float 8s ease-in-out infinite 0.7s',
          }}
        />
          {/* PROFILE HERO SECTION */}
          <div
            style={{
              backgroundImage: 'url(/images/holographic-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '0 0 24px 24px',
              padding: '32px 20px 28px 20px',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(232, 93, 47, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Dark overlay for text readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                zIndex: 1,
              }}
            />
            {/* Avatar */}
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                border: '4px solid white',
                boxShadow: '0 8px 20px rgba(232, 93, 47, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <User size={48} color="white" strokeWidth={2} />
              {/* Verification Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#BFFF00',
                  border: '3px solid #F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={18} color="#1A1A1A" strokeWidth={2.5} />
              </div>
            </div>

            {/* User Info */}
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '22px',
                color: '#FFFFFF',
                letterSpacing: '-0.3px',
                marginBottom: '6px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {userProfile.name}
            </h2>
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: '13px',
                color: '#FFFFFF',
                position: 'relative',
                zIndex: 2,
              }}
            >
              ID: {userProfile.id}
            </p>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                justifyContent: 'center',
                marginTop: '20px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {[
                { label: 'Смен', value: userProfile.stats.shiftsCompleted, icon: Briefcase },
                { label: 'Рейтинг', value: userProfile.stats.rating, icon: Star },
                { label: 'Надёжность', value: `${userProfile.stats.reliability}%`, icon: Shield },
              ].map((stat, idx) => {
                const IconComponent = stat.icon
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconComponent size={20} color="#E85D2F" />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: '20px',
                        color: '#FFFFFF',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: '#FFFFFF',
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* GOSUSLUGI VERIFICATION SECTION */}
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <GosuslugiButton
              isVerified={isGosuslugiVerified}
              onVerify={() => {
                // Open Gosuslugi OAuth flow
                console.log('[v0] Opening Gosuslugi verification flow')
                // In production: window.location.href = 'https://gosuslugi.ru/oauth/...'
                // For demo, we'll just show verification badge after 2 seconds
                setTimeout(() => {
                  setIsGosuslugiVerified(true)
                }, 2000)
              }}
            />
          </div>

          {/* SKILLS SECTION */}
          <div
            style={{
              padding: '0 20px',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
              }}
            >
              Компетенции
            </h3>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {userProfile.skills.map((skill, idx) => {
                const isSelected = selectedSkills.has(skill.name)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleSkill(skill.name)}
                    style={{
                      display: 'inline-flex',
                      gap: '6px',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      background: isSelected ? 'rgba(191, 255, 0, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '1px solid #BFFF00'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isSelected ? '#BFFF00' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isSelected
                        ? 'rgba(191, 255, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected
                        ? 'rgba(191, 255, 0, 0.25)'
                        : 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {isSelected ? (
                      <CheckCircle size={14} strokeWidth={2.5} color="#BFFF00" />
                    ) : (
                      <Circle size={14} strokeWidth={2} color="#FFFFFF" />
                    )}
                    <span>{skill.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* WORK HISTORY SECTION */}
          <div
            style={{
              padding: '0 20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#FFFFFF',
                }}
              >
                Последние смены
              </h3>
              <button
                onClick={() => console.log('View all shifts')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#E85D2F',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF8855'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#E85D2F'
                }}
              >
                Все →
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {workHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/shift-details')}
                  style={{
                    background: 'rgba(245, 245, 245, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 245, 245, 0.7)'
                    e.currentTarget.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 245, 245, 0.5)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#E85D2F',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.payment}
                    </span>
                  </div>

                  {/* Company & Date */}
                  <p
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    {item.company} • {item.date}
                  </p>

                  {/* Bottom Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        background: 'rgba(191, 255, 0, 0.15)',
                        border: '1px solid #BFFF00',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: '#BFFF00',
                        letterSpacing: '0.5px',
                      }}
                    >
                      ЗАВЕРШЕНО
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '2px',
                      }}
                    >
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#FFD60A" color="#FFD60A" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOCUMENTS SECTION */}
          <div
            style={{
              padding: '0 20px',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '14px',
              }}
            >
              Документы и статус
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {documents.map((doc, idx) => {
                const IconComponent = doc.icon
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(245, 245, 245, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(232, 93, 47, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={20} color="#E85D2F" />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                          fontSize: '13px',
                          color: '#FFFFFF',
                          marginBottom: '4px',
                        }}
                      >
                        {doc.title}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#FFFFFF',
                          lineHeight: 1.3,
                        }}
                      >
                        <span>{doc.value}</span>
                        {doc.verified && <CheckCircle size={16} color="#BFFF00" />}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => console.log('Edit document')}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#E85D2F',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FF8855'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#E85D2F'
                      }}
                    >
                      {doc.action}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <div
            style={{
              padding: '0 20px 32px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <button
              onClick={() => console.log('Logout')}
              style={{
                width: '100%',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#9B9B9B',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <LogOut size={18} />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--rotate, 0deg)); }
        }
      `}</style>
    </div>
  )
}
