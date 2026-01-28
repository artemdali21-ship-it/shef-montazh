'use client'

import React from "react"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  SlidersHorizontal,
  FileText,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  Send,
  Zap,
  Star,
  Shield,
  Info,
  Inbox,
  Activity,
  XCircle,
} from 'lucide-react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface Application {
  id: number
  jobTitle: string
  company: string
  location: string
  date: string
  rate: number
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected'
  appliedAt: string
  responseTime?: string
  escrow: boolean
  rating?: number
  earnings?: number
  rejectionReason?: string
}

const applicationsData: Application[] = [
  {
    id: 1,
    jobTitle: 'Монтаж выставочного стенда',
    company: 'Decor Factory',
    location: 'Крокус Экспо',
    date: '28 января, 18:00',
    rate: 2500,
    status: 'approved',
    appliedAt: '27 января, 14:30',
    responseTime: '2 часа',
    escrow: true,
  },
  {
    id: 2,
    jobTitle: 'Сборка декораций для концерта',
    company: 'Event Pro',
    location: 'Олимпийский',
    date: '29 января, 20:00',
    rate: 3200,
    status: 'pending',
    appliedAt: '27 января, 16:45',
    responseTime: undefined,
    escrow: true,
  },
  {
    id: 3,
    jobTitle: 'Демонтаж после выставки',
    company: 'Expo Global',
    location: 'Экспоцентр',
    date: '26 января, 22:00',
    rate: 1800,
    status: 'completed',
    appliedAt: '25 января, 10:20',
    responseTime: '1 час',
    escrow: true,
    rating: 5,
    earnings: 1800,
  },
  {
    id: 4,
    jobTitle: 'Альпинистские работы на фасаде',
    company: 'Sky Works',
    location: 'Москва-Сити',
    date: '30 января, 09:00',
    rate: 4500,
    status: 'rejected',
    appliedAt: '27 января, 12:00',
    responseTime: '3 часа',
    escrow: true,
    rejectionReason: 'Выбран специалист с большим опытом',
  },
  {
    id: 5,
    jobTitle: 'Сборка сцены для концерта',
    company: 'Event Pro',
    location: 'ВТБ Арена',
    date: '31 января, 18:00',
    rate: 2800,
    status: 'active',
    appliedAt: '27 января, 09:00',
    responseTime: '30 минут',
    escrow: true,
  },
  {
    id: 6,
    jobTitle: 'Монтаж светового оборудования',
    company: 'Decor Factory',
    location: 'ВДНХ',
    date: '25 января, 14:00',
    rate: 2100,
    status: 'completed',
    appliedAt: '24 января, 11:15',
    responseTime: '1.5 часа',
    escrow: true,
    rating: 4,
    earnings: 2100,
  },
]

const filterTabs = [
  { id: 'all', label: 'Все', count: 6 },
  { id: 'pending', label: 'Ожидают', count: 1 },
  { id: 'approved', label: 'Одобрены', count: 1 },
  { id: 'active', label: 'В работе', count: 1 },
  { id: 'completed', label: 'Завершены', count: 2 },
  { id: 'rejected', label: 'Отклонены', count: 1 },
]

export default function MyApplicationsScreen() {
  const router = useRouter(); // Declare the router variable
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return applicationsData
    return applicationsData.filter((app) => app.status === activeFilter)
  }, [activeFilter])

  const stats = useMemo(() => {
    return {
      total: applicationsData.length,
      active: applicationsData.filter((a) =>
        ['pending', 'approved', 'active'].includes(a.status)
      ).length,
      completed: applicationsData.filter((a) => a.status === 'completed').length,
    }
  }, [])

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string
        color: string
        icon: any
        bgColor: string
        borderColor: string
      }
    > = {
      pending: {
        label: 'ОЖИДАЕТ',
        color: '#FFD60A',
        icon: Clock,
        bgColor: 'rgba(255, 214, 10, 0.15)',
        borderColor: '#FFD60A',
      },
      approved: {
        label: 'ОДОБРЕНО',
        color: '#BFFF00',
        icon: CheckCircle,
        bgColor: 'rgba(191, 255, 0, 0.15)',
        borderColor: '#BFFF00',
      },
      active: {
        label: 'В РАБОТЕ',
        color: '#E85D2F',
        icon: Activity,
        bgColor: 'rgba(232, 93, 47, 0.15)',
        borderColor: '#E85D2F',
      },
      completed: {
        label: 'ЗАВЕРШЕНО',
        color: '#5B9FFF',
        icon: CheckCircle,
        bgColor: 'rgba(91, 159, 255, 0.15)',
        borderColor: '#5B9FFF',
      },
      rejected: {
        label: 'ОТКЛОНЕНО',
        color: '#FF4444',
        icon: XCircle,
        bgColor: 'rgba(255, 68, 68, 0.15)',
        borderColor: '#FF4444',
      },
    }
    return statusMap[status] || statusMap.pending
  }

  const getLeftBorderColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFD60A',
      approved: '#BFFF00',
      active: '#E85D2F',
      completed: '#5B9FFF',
      rejected: '#FF4444',
    }
    return colors[status] || '#6B6B6B'
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: 'Montserrat, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
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
      {/* FLOATING DECORATIVE ELEMENTS */}
      <img
        src="/images/helmet-silver.png"
        alt=""
        style={{
          position: 'fixed',
          top: '15%',
          right: '5%',
          width: '120px',
          height: 'auto',
          opacity: 0.5,
          zIndex: 1,
          animation: 'float 5s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <img
        src="/images/concrete-6.png"
        alt=""
        style={{
          position: 'fixed',
          top: '15%',
          left: '5%',
          width: '96px',
          height: 'auto',
          opacity: 0.08,
          transform: 'rotate(-6deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <img
        src="/images/wrench-key.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '18%',
          right: '8%',
          width: '64px',
          height: 'auto',
          opacity: 0.08,
          transform: 'rotate(-20deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 1s',
        }}
      />

      {/* HEADER - FIXED */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '20px',
          background: 'rgba(42, 42, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
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
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>

        <h1
          style={{
            fontWeight: 700,
            fontSize: '16px',
            color: '#FFFFFF',
            flex: 1,
            textAlign: 'center',
          }}
        >
          Мои отклики
        </h1>

        <button
          onClick={() => console.log('Open advanced filters')}
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
          <SlidersHorizontal size={18} color="#FFFFFF" />
        </button>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
      }} className="pb-24">
          {/* STATS SUMMARY */}
          <div
            style={{
              marginTop: '0px',
              marginBottom: '0px',
              marginLeft: '0px',
              marginRight: '0px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: 'none',
              borderRadius: '0px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {[
              {
                label: 'Всего',
                value: stats.total,
                color: '#FFFFFF',
                icon: FileText,
              },
              {
                label: 'Активных',
                value: stats.active,
                color: '#BFFF00',
                icon: Clock,
              },
              {
                label: 'Завершено',
                value: stats.completed,
                color: '#E85D2F',
                icon: CheckCircle,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: `rgba(${stat.color === '#6B6B6B' ? '107, 107, 107' : stat.color === '#BFFF00' ? '191, 255, 0' : '232, 93, 47'}, 0.1)`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  {React.createElement(stat.icon, { size: 16, color: stat.color })}
                </div>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '24px',
                    color: '#1A1A1A',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: '11px',
                    color: '#FFFFFF',
                    marginTop: '4px',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* FILTER TABS */}
          <div
            style={{
              position: 'relative',
              zIndex: 30,
              background: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px 20px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  display: 'inline-flex',
                  gap: '6px',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background:
                    activeFilter === tab.id
                      ? '#E85D2F'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    activeFilter === tab.id
                      ? '1px solid #E85D2F'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow:
                    activeFilter === tab.id
                      ? '0 4px 12px rgba(232, 93, 47, 0.3)'
                      : 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: activeFilter === tab.id ? '#FFFFFF' : '#9B9B9B',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: activeFilter === tab.id ? '#FFFFFF' : '#9B9B9B',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* APPLICATIONS LIST */}
          <div
            style={{
              padding: '0 20px 100px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {filteredApplications.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '60px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px dashed rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Inbox size={32} color="#6B6B6B" />
                </div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#FFFFFF',
                    marginBottom: '8px',
                  }}
                >
                  Нет откликов
                </h2>
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    lineHeight: 1.6,
                    maxWidth: '280px',
                    marginBottom: '24px',
                  }}
                >
                  Здесь будут отображаться все ваши заявки на смены
                </p>
                <button
                  onClick={() => console.log('Navigate to /feed')}
                  style={{
                    padding: '12px 24px',
                    background: '#E85D2F',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Найти смены
                </button>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const statusInfo = getStatusInfo(app.status)
                const StatusIcon = statusInfo.icon
                const borderColor = getLeftBorderColor(app.status)

                return (
                  <div
                    key={app.id}
                    onClick={() => console.log('View application details')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateX(2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    {/* LEFT BORDER ACCENT */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: borderColor,
                        borderRadius: '14px 0 0 14px',
                      }}
                    />

                    {/* CARD HEADER */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ paddingLeft: '12px', flex: 1 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: '#FFFFFF',
                            lineHeight: 1.3,
                            marginBottom: '6px',
                          }}
                        >
                          {app.jobTitle}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#FFFFFF',
                          }}
                        >
                          <MapPin size={12} />
                          <span>
                            {app.company} • {app.location}
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: '16px',
                          color: '#E85D2F',
                        }}
                      >
                        {app.rate} ₽
                      </p>
                    </div>

                    {/* STATUS BADGE ROW */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        paddingLeft: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: '6px',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: statusInfo.bgColor,
                          border: `1px solid ${statusInfo.borderColor}`,
                          fontWeight: 700,
                          fontSize: '11px',
                          color: statusInfo.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <StatusIcon size={12} />
                        <span>{statusInfo.label}</span>
                      </div>

                      {/* Removed escrow button */}
                    </div>

                    {/* METADATA ROW */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#FFFFFF',
                        paddingLeft: '12px',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <Calendar size={12} />
                        <span>{app.date}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <Send size={12} />
                        <span>Отклик: {app.appliedAt.split(',')[0]}</span>
                      </div>

                      {app.responseTime && app.status !== 'pending' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                        >
                          <Zap size={12} />
                          <span>Ответ: {app.responseTime}</span>
                        </div>
                      )}
                    </div>

                    {/* ADDITIONAL INFO */}
                    {app.status === 'completed' && (
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          paddingLeft: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: app.rating || 0 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill="#FFD60A"
                              color="#FFD60A"
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: '13px',
                            color: '#BFFF00',
                          }}
                        >
                          Получено: {app.earnings} ₽
                        </p>
                      </div>
                    )}

                    {app.status === 'rejected' && (
                      <div
                        style={{
                          marginTop: '12px',
                          background: 'rgba(255, 68, 68, 0.1)',
                          border: '1px solid rgba(255, 68, 68, 0.2)',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#FF4444',
                          paddingLeft: '12px',
                        }}
                      >
                        <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{app.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav userType="worker" />
    </div>
  )
}
