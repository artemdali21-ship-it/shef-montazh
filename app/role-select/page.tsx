'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Wrench, HardHat, Check } from 'lucide-react'

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

export default function RoleSelectScreen() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: 'client',
      icon: Building2,
      title: 'Заказчик',
      subtitle: 'Агентство, продюсер, компания',
    },
    {
      id: 'worker',
      icon: Wrench,
      title: 'Исполнитель',
      subtitle: 'Монтажник, декоратор, техник',
    },
    {
      id: 'shef',
      icon: HardHat,
      title: 'Шеф-монтажник',
      subtitle: 'Бригадир, координатор',
    },
  ]

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId)
    localStorage.setItem('userRole', roleId)
    router.push(`/register?role=${roleId}`)
  }

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center font-sans relative"
      style={{
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <NoisePattern />

      {/* FLOATING 3D ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/helmet.png"
          alt=""
          style={{
            position: 'fixed',
            top: '10%',
            right: '5%',
            width: '140px',
            height: 'auto',
            opacity: 0.15,
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <img
          src="/images/carabiner.png"
          alt=""
          style={{
            position: 'fixed',
            bottom: '15%',
            left: '5%',
            width: '100px',
            height: 'auto',
            opacity: 0.12,
            transform: 'rotate(-20deg)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite 1s',
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
      <div className="w-full max-w-sm px-6 py-12 relative z-20 overflow-y-auto flex flex-col" style={{ maxHeight: '100vh' }}>
        {/* HEADER */}
        <div className="mb-8">
          <h1 style={{ color: '#FFFFFF' }} className="text-4xl font-sans mb-2" style={{ fontWeight: 800, lineHeight: 1.2 }}>
            Кто вы?
          </h1>
          <p style={{ color: '#FFFFFF' }} className="text-base font-normal leading-relaxed font-sans opacity-80">
            Выберите подходящий статус
          </p>
        </div>

        {/* ROLE CARDS */}
        <div className="space-y-3 flex-1 flex flex-col justify-center mb-6">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id

            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                disabled={selectedRole !== null && selectedRole !== role.id}
                className="relative group w-full flex items-start gap-4 p-6 rounded-2xl transition-all duration-200 text-left font-sans"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(232, 93, 47, 0.3) 0%, rgba(232, 93, 47, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isSelected ? '2px solid rgba(232, 93, 47, 0.8)' : '1.5px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isSelected
                    ? '0 8px 32px rgba(232, 93, 47, 0.25), inset 0 0 0 1px rgba(255,255,255,0.3)'
                    : '0 2px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)',
                  cursor: selectedRole === null || isSelected ? 'pointer' : 'default',
                  opacity: selectedRole !== null && !isSelected ? 0.5 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (selectedRole === null || isSelected) {
                    e.currentTarget.style.transform = isSelected ? 'scale(1.04)' : 'scale(1.02)'
                    e.currentTarget.style.boxShadow = isSelected
                      ? '0 12px 40px rgba(232, 93, 47, 0.3), inset 0 0 0 1px rgba(255,255,255,0.4)'
                      : '0 4px 16px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)'
                  e.currentTarget.style.boxShadow = isSelected
                    ? '0 8px 32px rgba(232, 93, 47, 0.25), inset 0 0 0 1px rgba(255,255,255,0.3)'
                    : '0 2px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)'
                }}
              >
                {/* ICON */}
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-300"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: isSelected
                      ? 'rgba(232, 93, 47, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: isSelected ? '2px solid rgba(232, 93, 47, 0.6)' : '1.5px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(232, 93, 47, 0.2), inset 0 0 0 1px rgba(255,255,255,0.2)'
                      : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon
                    size={28}
                    style={{
                      color: isSelected ? '#E85D2F' : '#FFFFFF',
                      transition: 'color 0.3s',
                    }}
                  />
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <h3 style={{ color: '#FFFFFF' }} className="text-lg font-sans mb-1" style={{ fontWeight: 700 }}>
                    {role.title}
                  </h3>
                  <p style={{ color: '#FFFFFF' }} className="text-sm font-normal opacity-70 font-sans">
                    {role.subtitle}
                  </p>
                </div>

                {/* CHECKMARK */}
                {isSelected && (
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(232, 93, 47, 0.9)',
                      boxShadow: '0 4px 12px rgba(232, 93, 47, 0.4)',
                    }}
                  >
                    <Check size={18} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* FINE PRINT */}
        <p style={{ color: '#FFFFFF' }} className="text-xs text-center tracking-tight leading-snug flex-shrink-0 font-sans opacity-70">
          Можно изменить роль в настройках позже
        </p>
      </div>
    </div>
  )
}
