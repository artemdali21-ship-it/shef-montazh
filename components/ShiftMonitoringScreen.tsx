'use client';

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
import { BottomNav } from './BottomNav';

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
      id: 1,
      name: 'Никита Соколов',
      role: 'Монтажник',
      status: 'on_site',
      checkInTime: '18:05',
      rating: 4.9,
      shiftCount: 47,
    },
    {
      id: 2,
      name: 'Игорь Петров',
      role: 'Шеф-монтажник',
      status: 'on_site',
      checkInTime: '17:58',
      rating: 4.8,
      shiftCount: 132,
    },
    {
      id: 3,
      name: 'Алексей Морозов',
      role: 'Монтажник',
      status: 'on_site',
      checkInTime: '18:12',
      rating: 4.7,
      shiftCount: 28,
    },
    {
      id: 4,
      name: 'Дмитрий Волков',
      role: 'Монтажник',
      status: 'pending',
      checkInTime: null,
      rating: 4.6,
      shiftCount: 19,
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
        backgroundImage: 'url(/images/bg-gradient.png)',
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
      <div style={{ paddingTop: '64px', paddingBottom: '160px' }}>
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
            {workers.map((worker) => (
              <div
                key={worker.id}
                style={{
                  background: 'rgba(169, 169, 169, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(169, 169, 169, 0.3)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(169, 169, 169, 0.2)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: getStatusColor(worker.status),
                    borderRadius: '14px 0 0 14px',
                  }}
                />

                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(232, 93, 47, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <User size={28} color="#E85D2F" />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: getStatusColor(worker.status),
                      border: '2px solid #2A2A2A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getStatusIcon(worker.status)}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px',
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#FFFFFF',
                      }}
                    >
                      {worker.name}
                    </h4>
                    <button
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <MessageCircle size={16} color="#FFFFFF" />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#FFFFFF',
                      }}
                    >
                      {worker.role}
                    </span>
                    <span style={{ color: '#FFFFFF' }}>•</span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '3px',
                        alignItems: 'center',
                      }}
                    >
                      <Star size={12} fill="#FFD60A" color="#FFD60A" />
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#FFD60A',
                        }}
                      >
                        {worker.rating}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#FFFFFF',
                      }}
                    >
                      • {worker.shiftCount} смен
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '5px',
                        alignItems: 'center',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: getStatusBgColor(worker.status),
                        border: `1px solid ${getStatusColor(worker.status)}`,
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '10px',
                        color: getStatusColor(worker.status),
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      <MapPin size={10} />
                      {worker.status === 'on_site' && 'НА ОБЪЕКТЕ'}
                      {worker.status === 'pending' && 'ОЖИДАЕТ'}
                    </div>
                    {worker.status === 'on_site' && (
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 500,
                          fontSize: '11px',
                          color: '#FFFFFF',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <Check size={10} /> Вышел в {worker.checkInTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESCROW STATUS CARD */}
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
                <Shield size={20} color="#BFFF00" />
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#FFFFFF',
                  }}
                >
                  Эскроу-счёт
                </h3>
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '10px',
                  color: '#BFFF00',
                  padding: '4px 8px',
                  background: 'rgba(191, 255, 0, 0.15)',
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                }}
              >
                ЗАМОРОЖЕНО
              </div>
            </div>

            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: '24px',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
                marginBottom: '6px',
              }}
            >
              11 200 ₽
            </p>
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                color: '#FFFFFF',
              }}
            >
              4 чел. × 2 500 ₽ + комиссия 1 200 ₽ (12%)
            </p>

            <div
              style={{
                marginTop: '14px',
                background: 'rgba(191, 255, 0, 0.08)',
                border: '1px solid rgba(191, 255, 0, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <Info size={16} color="#BFFF00" style={{ flexShrink: 0 }} />
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  lineHeight: '1.5',
                }}
              >
                Средства будут разморожены после подтверждения выполнения работ
                шеф-монтажником
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
