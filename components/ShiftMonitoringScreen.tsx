'use client'

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  User,
  HardHat,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  Phone,
  Shield,
  Info,
  FileText,
  StopCircle,
  Check,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Header } from './Header';
import WorkerStatusList from './monitoring/WorkerStatusList';

export default function ShiftMonitoringScreen() {
  const router = useRouter()
  const [shiftData, setShiftData] = useState({
    id: 1,
    title: 'Монтаж выставочного стенда',
    location: 'Крокус Экспо, павильон 3',
    date: '28 января',
    startTime: '18:00',
    endTime: '02:00',
    status: 'in_progress',
    elapsedSeconds: 13335,
    totalSeconds: 28800,
  });

  const workers = [
    {
      id: '1',
      name: 'Никита Соколов',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      status: 'checked_in' as const,
      checkInTime: '18:05',
      checkInPhoto: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
      lateMinutes: 0,
    },
    {
      id: '2',
      name: 'Игорь Петров',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      status: 'checked_in' as const,
      checkInTime: '17:58',
      checkInPhoto: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
      lateMinutes: 0,
    },
    {
      id: '3',
      name: 'Алексей Морозов',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      status: 'checked_in' as const,
      checkInTime: '18:12',
      checkInPhoto: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
      lateMinutes: 0,
    },
    {
      id: '4',
      name: 'Дмитрий Волков',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      status: 'on_way' as const,
      lateMinutes: 15,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShiftData((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progress = Math.round(
    (shiftData.elapsedSeconds / shiftData.totalSeconds) * 100
  );
  const workersOnSite = workers.filter((w) => w.status === 'on_site').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_site':
        return '#BFFF00';
      case 'pending':
        return '#FFD60A';
      case 'problem':
        return '#FF4444';
      default:
        return '#6B6B6B';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'on_site':
        return 'rgba(191, 255, 0, 0.15)';
      case 'pending':
        return 'rgba(255, 214, 10, 0.15)';
      case 'problem':
        return 'rgba(255, 68, 68, 0.15)';
      default:
        return 'rgba(107, 107, 107, 0.15)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_site':
        return <CheckCircle size={12} color="#1A1A1A" />;
      case 'pending':
        return <Clock size={12} color="#1A1A1A" />;
      case 'problem':
        return <AlertTriangle size={12} color="#FFFFFF" />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 50%, #1A1A1A 100%)',
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* MONITORING 3D ELEMENTS - BUILDING AND CABLE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <img src="/images/building.png" className="absolute top-1/3 right-10 w-40 h-40" alt="" />
        <img src="/images/cable-coil.png" className="absolute bottom-20 left-5 w-28 h-28" style={{animation: 'float 7s ease-in-out infinite 0.5s'}} alt="" />
      </div>

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
      {/* FLOATING CONCRETE - бетон 3 */}
      <img
        src="/images/concrete-3.png"
        alt=""
        style={{
          position: 'fixed',
          top: '5%',
          left: '3%',
          width: '96px',
          height: 'auto',
          opacity: 0.08,
          transform: 'rotate(-15deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* FLOATING BRUSH - Monitoring (мазок, paint brush) */}
      <img
        src="/images/brush.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '12%',
          right: '5%',
          width: '96px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(-8deg)',
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
          background: 'rgba(42, 42, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <button
          onClick={() => router.back()}
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
            flex: 1,
            textAlign: 'center',
          }}
        >
          Мониторинг смены
        </h1>

        <button
          onClick={() => window.location.reload()}
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
          }}
        >
          <RefreshCw size={18} color="#FFFFFF" />
        </button>
      </header>

      {/* CONTENT */}
      <div style={{ paddingTop: '64px', paddingBottom: '160px', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
        {/* STATUS BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #BFFF00 0%, #A8E600 100%)',
            padding: '24px 20px',
            borderRadius: '0 0 24px 24px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(191, 255, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: '12px',
                color: '#1A1A1A',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              СТАТУС СМЕНЫ
            </p>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '22px',
                color: '#1A1A1A',
                letterSpacing: '-0.3px',
              }}
            >
              В работе
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#1A1A1A',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                color: '#1A1A1A',
                letterSpacing: '0.5px',
              }}
            >
              LIVE
            </p>
          </div>
        </div>

        {/* SHIFT INFO CARD */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div
            style={{
              background: 'rgba(169, 169, 169, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
              }}
            >
              {shiftData.title}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
            >
              {[
                {
                  icon: MapPin,
                  label: 'Локация',
                  value: shiftData.location,
                },
                { icon: Calendar, label: 'Дата', value: shiftData.date },
                {
                  icon: Clock,
                  label: 'Время',
                  value: `${shiftData.startTime} - ${shiftData.endTime}`,
                },
                {
                  icon: Users,
                  label: 'Бригада',
                  value: '4 человека',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <item.icon size={16} color="#E85D2F" />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: '#FFFFFF',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROGRESS & EARNINGS CARD */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div
            style={{
              background: 'rgba(169, 169, 169, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
            }}
          >
            {/* TIMER */}
            <div>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(191, 255, 0, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Clock size={18} color="#BFFF00" />
              </div>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                }}
              >
                ВРЕМЯ
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                  lineHeight: '1',
                }}
              >
                {formatTime(shiftData.elapsedSeconds)}
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '11px',
                  color: '#FFFFFF',
                  marginTop: '4px',
                }}
              >
                из 8 часов
              </p>
            </div>

            {/* PROGRESS */}
            <div>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(232, 93, 47, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <TrendingUp size={18} color="#E85D2F" />
              </div>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                }}
              >
                ПРОГРЕСС
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#E85D2F',
                  letterSpacing: '-0.5px',
                  lineHeight: '1',
                }}
              >
                {progress}%
              </p>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginTop: '10px',
                }}
              >
                <div
                  style={{
                    height: '6px',
                    background: `linear-gradient(90deg, #E85D2F 0%, #FF8855 100%)`,
                    width: `${progress}%`,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* WORKERS STATUS SECTION */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
              }}
            >
              Бригада ({workersOnSite}/4)
            </h3>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: '#FFFFFF',
              }}
            >
              Все
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <WorkerStatusList workers={workers} shiftStartTime={shiftData.startTime} />
          </div>
        </div>

        {/* PAYMENT INFO CARD - NO ESCROW */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div
            style={{
              background: 'rgba(169, 169, 169, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px',
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
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <TrendingUp size={20} color="#E85D2F" />
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#FFFFFF',
                  }}
                >
                  Информация об оплате
                </h3>
              </div>
            </div>

            {/* Cost breakdown */}
            <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '13px', color: '#FFFFFF' }}>
                  Стоимость работ:
                </span>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>
                  10 000 ₽
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#FFFFFF', opacity: 0.7, paddingLeft: '0' }}>
                (4 чел. × 2 500 ₽)
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '13px', color: '#FFFFFF' }}>
                  Комиссия платформы:
                </span>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>
                  + 1 200 ₽
                </span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '14px', color: '#BFFF00' }}>
                  Итого к оплате:
                </span>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '16px', color: '#BFFF00' }}>
                  11 200 ₽
                </span>
              </div>
            </div>

            {/* Info box - NO ESCROW */}
            <div
              style={{
                marginTop: '14px',
                background: 'rgba(232, 93, 47, 0.08)',
                border: '1px solid rgba(232, 93, 47, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <Info size={16} color="#E85D2F" style={{ flexShrink: 0 }} />
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  lineHeight: '1.5',
                }}
              >
                Оплата будет доступна после завершения смены, подтверждения исполнителями и взаимной оценки.
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <button
              onClick={() => alert('Запрос отправлен. Вы получите отчет по email.')}
              style={{
                width: '100%',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <FileText size={18} />
              Запросить отчёт от шефа
            </button>

            <button
              onClick={() => alert('Спасибо за обратную связь. Поддержка рассмотрит вашу проблему.')}
              style={{
                width: '100%',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <AlertTriangle size={18} />
              Сообщить о проблеме
            </button>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM BAR */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(26, 26, 26, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '16px 20px 28px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontSize: '11px',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          Смена завершится автоматически в 02:00
        </p>
        <button
          onClick={() => alert('Смена завершена. Спасибо за работу!')}
          style={{
            width: '100%',
            height: '52px',
            background: '#E85D2F',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '15px',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(232, 93, 47, 0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D04D1F';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#E85D2F';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <StopCircle size={20} />
          Завершить смену досрочно
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15);
          }
        }
      `}</style>
      </div>
    </div>
  )
}
