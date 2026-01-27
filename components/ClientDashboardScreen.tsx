'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Bell,
  Shield,
  Plus,
  Receipt,
  Briefcase,
  Clock,
  CheckCircle,
  MapPin,
  Users,
  Calendar,
  Activity,
  FileText,
  BarChart3,
  HardHat,
} from 'lucide-react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

const clientData = {
  company: {
    name: 'Decor Factory',
    accountType: 'Премиум аккаунт',
  },
  balance: {
    escrow: 47500,
    frozen: 47500,
    activeShifts: 3,
  },
  stats: {
    total: 47,
    active: 3,
    completed: 42,
  },
  notifications: {
    unread: 2,
  },
}

const activeShifts = [
  {
    id: 1,
    title: 'Монтаж выставочного стенда',
    company: 'Decor Factory',
    location: 'Крокус Экспо',
    date: '28 января, 18:00',
    workers: { confirmed: 3, total: 4 },
    status: 'in_progress',
    rate: 2500,
    borderColor: '#BFFF00',
  },
  {
    id: 2,
    title: 'Сборка декораций для концерта',
    company: 'Event Pro',
    location: 'Олимпийский',
    date: '29 января, 20:00',
    workers: { confirmed: 5, total: 5 },
    status: 'pending',
    rate: 3200,
    borderColor: '#FFD60A',
  },
]

const quickActions = [
  {
    icon: Plus,
    label: 'Создать смену',
    subtitle: 'За 2 клика',
    color: '#E85D2F',
  },
  {
    icon: Users,
    label: 'Мои бригады',
    subtitle: '23 человека',
    color: '#BFFF00',
  },
  {
    icon: FileText,
    label: 'Документы',
    subtitle: 'Акты, договоры',
    color: '#9B9B9B',
  },
  {
    icon: BarChart3,
    label: 'Аналитика',
    subtitle: 'Отчёты',
    color: '#9B9B9B',
  },
]

export default function ClientDashboardScreen() {
  const [fabHovered, setFabHovered] = useState(false)

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
          background: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* FLOATING TAPE 4 - B2B Dashboard */}
      <img
        src="/images/tape-4.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '20%',
          left: '4%',
          width: '96px',
          height: 'auto',
          opacity: 0.12,
          transform: 'rotate(-15deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 0.8s',
        }}
      />

      {/* FLOATING SAW - B2B Dashboard (right bottom) */}
      <img
        src="/images/saw.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '3%',
          width: '104px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(-12deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 1.2s',
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
            zIndex: 50,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '20px',
            paddingRight: '20px',
            background: 'transparent',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} color="#FFFFFF" />
            </div>

            {/* Company Info */}
            <div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#FFFFFF',
                }}
              >
                {clientData.company.name}
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  color: '#FFFFFF',
                }}
              >
                {clientData.company.accountType}
              </div>
            </div>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => console.log('Open notifications')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <Bell size={18} color="#FFFFFF" />
            {clientData.notifications.unread > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#E85D2F',
                }}
              />
            )}
          </button>
        </header>

        {/* CONTENT */}
        <div style={{ paddingTop: '80px', paddingBottom: '120px' }}>
          {/* HERO SECTION */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
              padding: '32px 20px 28px 20px',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '200px',
            }}
          >
            {/* 3D Hard Hat Decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-40px',
                opacity: 0.15,
                filter: 'brightness(1.1)',
              }}
            >
              <HardHat size={180} color="#E85D2F" />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Escrow Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  gap: '6px',
                  alignItems: 'center',
                  background: 'rgba(191, 255, 0, 0.15)',
                  border: '1px solid #BFFF00',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                }}
              >
                <Shield size={14} color="#BFFF00" />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#BFFF00',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Эскроу защита
                </span>
              </div>

              {/* Balance */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    marginBottom: '8px',
                  }}
                >
                  БАЛАНС НА СЧЁТЕ
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: '40px',
                    color: '#FFFFFF',
                    letterSpacing: '-1.5px',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}
                >
                  {clientData.balance.escrow.toLocaleString('ru-RU')} ₽
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: '#FFFFFF',
                  }}
                >
                  Заморожено для {clientData.balance.activeShifts} активных смен
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {/* Top Up Button */}
                <button
                  onClick={() => console.log('Top up balance')}
                  style={{
                    flex: 1,
                    height: '48px',
                    background: '#E85D2F',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(232, 93, 47, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 93, 47, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 93, 47, 0.4)'
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Пополнить
                </button>

                {/* History Button */}
                <button
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => console.log('View payment history')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <Receipt size={18} color="#9B9B9B" />
                </button>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
              }}
            >
              {[
                {
                  icon: Briefcase,
                  label: 'Всего',
                  value: clientData.stats.total,
                  color: '#FFFFFF',
                },
                {
                  icon: Clock,
                  label: 'Активных',
                  value: clientData.stats.active,
                  color: '#BFFF00',
                },
                {
                  icon: CheckCircle,
                  label: 'Завершено',
                  value: clientData.stats.completed,
                  color: '#6B6B6B',
                },
              ].map((stat, idx, arr) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRight:
                      idx < arr.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : 'none',
                  }}
                >
                  <stat.icon size={24} color={stat.color} style={{ marginBottom: '8px' }} />
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '28px',
                      color: stat.color,
                      letterSpacing: '-0.5px',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '11px',
                      color: '#FFFFFF',
                      marginTop: '4px',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE SHIFTS SECTION */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#FFFFFF',
                }}
              >
                Активные смены
              </h2>
              <button
                onClick={() => console.log('View all shifts')}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#E85D2F',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Все →
              </button>
            </div>

            {activeShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  background: 'rgba(169, 169, 169, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(169, 169, 169, 0.3)'
                  e.currentTarget.style.transform = 'translateX(2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(169, 169, 169, 0.2)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* Left Border Accent */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    borderRadius: '14px 0 0 14px',
                    background: shift.borderColor,
                  }}
                />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#FFFFFF',
                        lineHeight: 1.3,
                        marginBottom: '6px',
                      }}
                    >
                      {shift.title}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <MapPin size={12} color="#9B9B9B" />
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#FFFFFF',
                        }}
                      >
                        {shift.company} • {shift.location}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '17px',
                      color: '#E85D2F',
                    }}
                  >
                    {shift.rate} ₽
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {shift.status === 'in_progress' ? (
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '6px',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(191, 255, 0, 0.15)',
                        border: '1px solid #BFFF00',
                      }}
                    >
                      <Activity size={12} color="#BFFF00" />
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '11px',
                          color: '#BFFF00',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        В РАБОТЕ
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '6px',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 214, 10, 0.15)',
                        border: '1px solid #FFD60A',
                      }}
                    >
                      <Clock size={12} color="#FFD60A" />
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '11px',
                          color: '#FFD60A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        ОЖИДАЕТ
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'inline-flex',
                      gap: '4px',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: 'rgba(107, 107, 107, 0.2)',
                      borderRadius: '6px',
                    }}
                  >
                    <Shield size={12} color="#6B6B6B" />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '10px',
                        color: '#FFFFFF',
                      }}
                    >
                      ЭСКРОУ
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Calendar size={13} color="#9B9B9B" />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#FFFFFF',
                      }}
                    >
                      {shift.date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Users size={13} color="#9B9B9B" />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#FFFFFF',
                      }}
                    >
                      Бригада: {shift.workers.confirmed}/{shift.workers.total}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '16px',
              }}
            >
              Быстрые действия
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    onClick={() => console.log(`Action: ${action.label}`)}
                    style={{
                      height: '100px',
                      background: 'rgba(169, 169, 169, 0.2)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(169, 169, 169, 0.3)'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(169, 169, 169, 0.2)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: `rgba(${action.color === '#E85D2F' ? '232, 93, 47' : action.color === '#BFFF00' ? '191, 255, 0' : '155, 155, 155'}, 0.15)`,
                        borderRadius: '10px',
                      }}
                    >
                      <Icon size={18} color={action.color} />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#FFFFFF',
                          lineHeight: 1.2,
                          marginBottom: '2px',
                        }}
                      >
                        {action.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 400,
                          fontSize: '11px',
                          color: '#FFFFFF',
                        }}
                      >
                        {action.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* CREATE SHIFT FAB */}
        <button
          onClick={() => console.log('Create shift - MAIN CTA')}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#E85D2F',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(232, 93, 47, 0.6)',
            transition: fabHovered
              ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'all 0.2s ease',
            zIndex: 40,
            transform: fabHovered ? 'scale(1.08) rotate(90deg)' : 'scale(1)',
          }}
          onMouseEnter={() => {
            setFabHovered(true)
          }}
          onMouseLeave={() => {
            setFabHovered(false)
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = fabHovered
              ? 'scale(1.08) rotate(90deg)'
              : 'scale(1)'
          }}
        >
          <Plus size={32} color="white" strokeWidth={3} />
        </button>
      </div>

      <style>{`
        @keyframes fab-pulse {
          0%, 100% {
            box-shadow: 0 8px 28px rgba(232, 93, 47, 0.6);
          }
          50% {
            box-shadow: 0 8px 32px rgba(232, 93, 47, 0.8), 0 0 0 12px rgba(232, 93, 47, 0.15);
          }
        }
      `}</style>
    </div>
  )
}
