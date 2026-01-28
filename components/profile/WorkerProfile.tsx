'use client'

import { useState } from 'react'
import { ArrowLeft, Settings, CheckCircle, Circle, User, Briefcase, Star, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

const userProfile = {
  id: 'SHF-0001',
  name: 'Иван Петров',
  rating: 4.9,
  stats: {
    shiftsCompleted: 127,
    rating: 4.9,
    reliability: 98,
  },
  skills: [
    { name: 'Сварка', level: 'advanced' },
    { name: 'Электрика', level: 'intermediate' },
    { name: 'Слесарь', level: 'advanced' },
    { name: 'Кровельщик', level: 'intermediate' },
    { name: 'Маляр', level: 'beginner' },
    { name: 'Монтаж', level: 'advanced' },
  ],
  recentShifts: [
    { id: 1, title: 'Демонтаж дверей', date: '25 января', price: 2500, status: 'completed' },
    { id: 2, title: 'Установка окон', date: '24 января', price: 3500, status: 'completed' },
    { id: 3, title: 'Электромонтажные работы', date: '22 января', price: 4000, status: 'completed' },
  ],
}

export default function WorkerProfile() {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState(new Set())
  const [isGosuslugiVerified, setIsGosuslugiVerified] = useState(false)

  const toggleSkill = (skillName) => {
    const newSkills = new Set(selectedSkills)
    if (newSkills.has(skillName)) {
      newSkills.delete(skillName)
    } else {
      newSkills.add(skillName)
    }
    setSelectedSkills(newSkills)
  }

  return (
    <div className="w-full flex flex-col overflow-hidden">
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
      <div className="flex-1 overflow-y-auto pt-16 pb-4 relative z-5">
        {/* PROFILE HEADER SECTION - GLASSMORPHIC */}
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glassmorphic blur lines background */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.15,
              pointerEvents: 'none',
            }}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <line x1="10" y1="0" x2="20" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
            <line x1="30" y1="0" x2="40" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="60" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
            <line x1="70" y1="0" x2="80" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
            <line x1="90" y1="0" x2="100" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
            <circle cx="50" cy="30" r="25" fill="none" stroke="rgba(232, 93, 47, 0.2)" strokeWidth="0.3" />
            <path d="M 0 50 Q 25 40, 50 50 T 100 50" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.4" />
          </svg>
          {/* Avatar */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'rgba(232, 93, 47, 0.2)',
                border: '2px solid #E85D2F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
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
            </div>

          {/* User Info */}
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            Иван Петров
          </h2>
          <p style={{ fontSize: '13px', color: '#FFFFFF', opacity: 0.7 }}>
            ID: SHF-0001
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
              { label: 'Смен', value: '127', icon: Briefcase },
              { label: 'Рейтинг', value: '4.9', icon: Star },
              { label: 'Надёжность', value: '98%', icon: Shield },
            ].map((stat, idx) => {
              const IconComponent = stat.icon
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <IconComponent size={20} color="#E85D2F" />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
                    {stat.value}
                  </span>
                  <span style={{ fontSize: '11px', color: '#FFFFFF', opacity: 0.7 }}>
                    {stat.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
            Компетенции
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
                    fontSize: '13px',
                    fontWeight: 600,
                    background: isSelected ? 'rgba(191, 255, 0, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid #BFFF00' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isSelected ? '#BFFF00' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
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

        {/* RECENT SHIFTS SECTION */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Последние смены
            </h3>
            <button
              onClick={() => console.log('View all shifts')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: '#E85D2F',
                cursor: 'pointer',
              }}
            >
              Все смены →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userProfile.recentShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(42, 42, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    {shift.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#FFFFFF', opacity: 0.6 }}>
                    {shift.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#E85D2F' }}>
                    ₽{shift.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
