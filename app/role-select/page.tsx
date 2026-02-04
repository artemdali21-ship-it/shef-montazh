'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, TrendingUp } from 'lucide-react'
import { useTelegram } from '@/lib/telegram'
import toast from 'react-hot-toast'

export default function RoleSelectScreen() {
  const router = useRouter()
  const tg = useTelegram()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  console.log('[RoleSelect] Component mounted/re-rendered, selectedRole:', selectedRole)

  const roles = [
    {
      id: 'client',
      icon: '/images/role-building.png',
      title: 'Заказчик',
      subtitle: 'Агентство, продюсер, компания',
      color: '#E85D2F',
      colorLight: 'rgba(232, 93, 47, 0.3)',
      colorBorder: 'rgba(232, 93, 47, 0.6)',
    },
    {
      id: 'worker',
      icon: '/toolbox-box.png',
      title: 'Исполнитель',
      subtitle: 'Монтажник, декоратор, техник',
      color: '#FFD60A',
      colorLight: 'rgba(255, 214, 10, 0.3)',
      colorBorder: 'rgba(255, 214, 10, 0.6)',
    },
    {
      id: 'shef',
      icon: '/images/role-helmet.png',
      title: 'Шеф-монтажник',
      subtitle: 'Бригадир, координатор',
      color: '#BFFF00',
      colorLight: 'rgba(191, 255, 0, 0.3)',
      colorBorder: 'rgba(191, 255, 0, 0.6)',
    },
  ]

  const handleSelectRole = async (roleId: string) => {
    console.log('[RoleSelect] ===== BUTTON CLICKED =====')
    console.log('[RoleSelect] Button clicked for role:', roleId)
    console.log('[RoleSelect] Selected role:', roleId)
    console.log('[RoleSelect] Current selectedRole state:', selectedRole)

    // Haptic feedback for iOS
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light')
    }

    setSelectedRole(roleId)
    setLoading(true)

    try {
      const telegramId = tg?.user?.id
      console.log('[RoleSelect] Telegram object:', tg)
      console.log('[RoleSelect] Telegram ID:', telegramId)
      console.log('[RoleSelect] Telegram user:', tg?.user)

      if (!telegramId) {
        console.error('[RoleSelect] No Telegram ID found!')
        toast.error('Telegram ID не найден. Откройте приложение через Telegram.')
        setLoading(false)
        setSelectedRole(null)
        return
      }

      console.log('[RoleSelect] Starting registration...', { telegramId, role: roleId, fullName: tg?.user?.first_name })

      // Register user with selected role via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          role: roleId,
          fullName: tg?.user?.first_name || 'User',
        }),
      })

      console.log('[RoleSelect] Response status:', response.status)

      const data = await response.json()
      console.log('[RoleSelect] Response data:', data)

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Ошибка регистрации'
        console.error('[RoleSelect] Registration error:', errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        setSelectedRole(null)
        return
      }

      toast.success('Регистрация успешна!')

      // Redirect directly to dashboard
      console.log('[RoleSelect] Redirecting to dashboard...')

      const dashboardPaths: { [key: string]: string } = {
        worker: '/worker/shifts',
        client: '/client/shifts',
        shef: '/shef/dashboard',
      }

      const dashboardPath = dashboardPaths[roleId] || '/worker/shifts'
      console.log('[RoleSelect] Navigating to:', dashboardPath)

      window.location.href = dashboardPath
    } catch (error: any) {
      console.error('[RoleSelect] Error:', error)
      toast.error('Ошибка подключения: ' + (error.message || 'Неизвестная ошибка'))
      setLoading(false)
      setSelectedRole(null)
    }
  }

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]"
    >
      {/* FLOATING 3D ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/wrench.png"
          alt=""
          style={{
            position: 'fixed',
            top: '8%',
            right: '6%',
            width: '160px',
            height: 'auto',
            opacity: 0.5,
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 7s ease-in-out infinite',
            filter: 'drop-shadow(0 10px 30px rgba(191, 255, 0, 0.15))',
          }}
        />
        <img
          src="/images/drill.png"
          alt=""
          style={{
            position: 'fixed',
            bottom: '12%',
            left: '8%',
            width: '120px',
            height: 'auto',
            opacity: 0.55,
            transform: 'rotate(-25deg)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: 'float 8s ease-in-out infinite 0.5s',
            filter: 'drop-shadow(0 10px 30px rgba(255, 214, 10, 0.25))',
          }}
        />
        <img
          src="/images/pliers.png"
          alt=""
          style={{
            position: 'fixed',
            top: '50%',
            right: '10%',
            width: '140px',
            height: 'auto',
            opacity: 0.6,
            transform: 'translateY(-50%)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: 'float 9s ease-in-out infinite 1s',
            filter: 'drop-shadow(0 10px 30px rgba(232, 93, 47, 0.25))',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) var(--transform, rotate(0deg)); }
          50% { transform: translateY(-30px) var(--transform, rotate(0deg)); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-sm px-6 py-12 relative z-20 overflow-y-auto flex flex-col" style={{ maxHeight: '100vh' }}>
        {/* HEADER */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: '4px', height: '28px', background: '#E85D2F', borderRadius: '2px' }} />
            <h1 style={{ color: '#FFFFFF' }} className="text-4xl" style={{ fontWeight: 800, lineHeight: 1.2, fontFamily: 'Montserrat' }}>
              Кто вы?
            </h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-base font-normal leading-relaxed" style={{ fontFamily: 'Montserrat' }}>
            Выберите подходящий статус
          </p>
        </div>

        {/* ROLE CARDS */}
        <div className="space-y-4 flex-1 flex flex-col justify-center mb-8">
          {roles.map((role, index) => {
            const isSelected = selectedRole === role.id

            return (
              <button
                key={role.id}
                onClick={() => {
                  console.log('[RoleSelect] onClick fired for role:', role.id)
                  handleSelectRole(role.id)
                }}
                onTouchStart={(e) => {
                  // iOS touch handling
                  e.currentTarget.style.opacity = '0.9'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.opacity = ''
                  handleSelectRole(role.id)
                }}
                disabled={loading}
                className="relative group w-full flex items-start gap-4 p-6 rounded-2xl transition-all duration-300 text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  animation: `slideUp 0.6s ease-out forwards`,
                  animationDelay: `${0.1 + index * 0.1}s`,
                  opacity: selectedRole !== null && !isSelected ? 0.4 : (0),
                  background: isSelected
                    ? `linear-gradient(135deg, ${role.colorLight} 0%, rgba(255, 255, 255, 0.05) 100%)`
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isSelected ? `2px solid ${role.colorBorder}` : '1.5px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isSelected
                    ? `0 12px 40px ${role.colorLight}, inset 0 0 0 1px rgba(255,255,255,0.3)`
                    : '0 4px 16px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
                  cursor: selectedRole === null || isSelected ? 'pointer' : 'default',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (selectedRole === null || isSelected) {
                    e.currentTarget.style.transform = isSelected ? 'scale(1.04)' : 'scale(1.02)'
                    e.currentTarget.style.boxShadow = isSelected
                      ? `0 16px 48px ${role.colorLight}, inset 0 0 0 1px rgba(255,255,255,0.4)`
                      : '0 8px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)'
                  e.currentTarget.style.boxShadow = isSelected
                    ? `0 12px 40px ${role.colorLight}, inset 0 0 0 1px rgba(255,255,255,0.3)`
                    : '0 4px 16px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)'
                }}
              >
                {/* ACCENT BAR */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      background: role.color,
                      animation: 'slideUp 0.6s ease-out',
                    }}
                  />
                )}

                {/* ICON CONTAINER */}
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-300"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: isSelected
                      ? `${role.colorLight}`
                      : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? `2px solid ${role.colorBorder}` : '1.5px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: isSelected
                      ? `0 8px 24px ${role.colorLight}, inset 0 0 0 1px rgba(255,255,255,0.2)`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src={role.icon || "/placeholder.svg"}
                    alt={role.title}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      filter: isSelected ? `drop-shadow(0 4px 12px ${role.colorLight})` : 'opacity(0.7)',
                      transition: 'all 0.3s ease-out',
                    }}
                  />
                </div>

                {/* TEXT CONTENT */}
                <div className="flex-1 py-1">
                  <h3 style={{ color: '#FFFFFF' }} className="text-lg mb-1" style={{ fontWeight: 700, fontFamily: 'Montserrat' }}>
                    {role.title}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="text-sm font-normal" style={{ fontFamily: 'Montserrat' }}>
                    {role.subtitle}
                  </p>
                </div>

                {/* CHECKMARK */}
                {isSelected && (
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: role.color,
                      boxShadow: `0 6px 16px ${role.colorLight}`,
                      animation: `slideUp 0.4s ease-out 0.2s forwards`,
                      opacity: 0,
                    }}
                  >
                    <Check size={20} className="text-white" strokeWidth={3} style={{ color: '#1A1A1A' }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* FOOTER TEXT */}
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="text-xs text-center tracking-tight leading-snug flex-shrink-0" style={{ fontFamily: 'Montserrat' }}>
          Можно изменить роль в настройках позже
        </p>
      </div>
    </div>
  )
}
