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
import { Header } from './Header'
import { BottomNav } from './BottomNav'

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

export default function ProfileScreen() {
  const router = useRouter(); // Declare the router variable
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(userProfile.skills.filter((s) => s.verified).map((s) => s.name))
  )

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
      {/* FLOATING WRENCH KEY 2 - Profile (SMALL - far) */}
      <img
        src="/images/wrench-key-2.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '3%',
          width: '80px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(30deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 0.5s',
        }}
      />
      {/* FLOATING CONCRETE 7 - Profile */}
      <img
        src="/images/concrete-7.png"
        alt=""
        style={{
          position: 'fixed',
          top: '5%',
          right: '5%',
          width: '112px',
          height: 'auto',
          opacity: 0.08,
          transform: 'rotate(18deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* HEADER */}
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
            Профиль
          </h1>

          <button
            onClick={() => console.log('Open settings')}
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
            <Settings size={18} color="#FFFFFF" />
          </button>
        </header>

        {/* CONTENT */}
        <div
          style={{
            paddingTop: '64px',
            paddingBottom: '96px',
            minHeight: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* PROFILE HERO SECTION */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '0 0 24px 24px',
              padding: '32px 20px 28px 20px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                border: '4px solid white',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                position: 'relative',
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

          {/* VERIFICATION CARD */}
          <div
            style={{
              padding: '0 20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(232, 93, 47, 0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background Pattern */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  opacity: 0.1,
                }}
              >
                <Shield size={120} color="white" />
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Status Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    gap: '6px',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <AlertCircle size={14} color="white" />
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'white',
                      letterSpacing: '0.5px',
                    }}
                  >
                    НЕ ПОДТВЕРЖДЕНО
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '19px',
                    color: 'white',
                    lineHeight: 1.3,
                    marginBottom: '10px',
                  }}
                >
                  Подтвердите личность через Госуслуги
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                  }}
                >
                  Верификация повысит ваш рейтинг и даст доступ к премиум-сменам с повышенной
                  ставкой.
                </p>

                {/* Benefits */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '20px',
                  }}
                >
                  {[
                    '✓ Доступ к VIP-объектам (+30% к ставке)',
                    '✓ Приоритет в поиске для заказчиков',
                    '✓ Защита от мошенников и подделок',
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => console.log('Open Госуслуги verification')}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#E85D2F',
                    letterSpacing: '0.3px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span>Подтвердить через Госуслуги</span>
                  <ExternalLink size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
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
