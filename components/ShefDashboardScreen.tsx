'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HardHat,
  Bell,
  ArrowRight,
  CheckCircle,
  Wallet,
  Star,
  User,
  Phone,
  ImageIcon,
  MapPin,
  Clock,
  Check,
  CheckSquare,
  Camera,
  AlertTriangle,
  FileText,
  Award,
  X,
  Send,
} from 'lucide-react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface CrewMember {
  id: number;
  name: string;
  role: string;
  status: 'on_site' | 'pending' | 'problem';
  checkInTime: string | null;
  rating: number;
  phone: string;
  canRate: boolean;
}

interface ChecklistItem {
  id: number;
  label: string;
  checked: boolean;
}

export default function ShefDashboardScreen() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: 1,
      name: 'Никита Соколов',
      role: 'Монтажник',
      status: 'on_site',
      checkInTime: '18:05',
      rating: 4.9,
      phone: '+7 999 123 45 67',
      canRate: false,
    },
    {
      id: 2,
      name: 'Алексей Морозов',
      role: 'Монтажник',
      status: 'on_site',
      checkInTime: '18:12',
      rating: 4.7,
      phone: '+7 999 234 56 78',
      canRate: false,
    },
    {
      id: 3,
      name: 'Дмитрий Волков',
      role: 'Монтажник',
      status: 'on_site',
      checkInTime: '18:08',
      rating: 4.6,
      phone: '+7 999 345 67 89',
      canRate: false,
    },
    {
      id: 4,
      name: 'Сергей Кузнецов',
      role: 'Монтажник',
      status: 'pending',
      checkInTime: null,
      rating: 4.5,
      phone: '+7 999 456 78 90',
      canRate: false,
    },
  ]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, label: 'Все работы выполнены', checked: false },
    { id: 2, label: 'Инструмент собран', checked: false },
    { id: 3, label: 'Площадка убрана', checked: false },
    { id: 4, label: 'Нет замечаний по качеству', checked: false },
  ]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comment, setComment] = useState('');

  const workersOnSite = crewMembers.filter((w) => w.status === 'on_site').length;
  const allChecked = checklist.every((item) => item.checked);

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleConfirmWork = () => {
    setShowRatingModal(true);
  };

  const handleRateSubmit = () => {
    console.log('Ratings submitted:', ratings, comment);
    setShowRatingModal(false);
    setComment('');
    setRatings({});
  };

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
          background: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          zIndex: 1,
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
            background: 'rgba(42, 42, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Profile Section */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
            {/* Avatar */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(232, 93, 47, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HardHat size={24} color="#E85D2F" />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Игорь Петров
              </p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Award size={12} color="#FFD60A" />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#FFFFFF',
                  }}
                >
                  Шеф-монтажник • 4.8★
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <button
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
              marginLeft: '12px',
            }}
          >
            <Bell size={18} color="#FFFFFF" />
            <div
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FF4444',
              }}
            />
          </button>
        </header>

        {/* CONTENT */}
        <div style={{ paddingTop: '80px', paddingBottom: '120px', paddingLeft: '20px', paddingRight: '20px' }}>
          {/* ACTIVE SHIFT BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #BFFF00 0%, #A8E600 100%)',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '16px',
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
                  fontSize: '11px',
                  color: '#1A1A1A',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                  margin: 0,
                }}
              >
                АКТИВНАЯ СМЕНА
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#1A1A1A',
                  marginBottom: '4px',
                  margin: 0,
                }}
              >
                Монтаж выставочного стенда
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(26, 26, 26, 0.7)',
                  margin: 0,
                }}
              >
                Крокус Экспо • 18:00-02:00
              </p>
            </div>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(26, 26, 26, 0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowRight size={20} color="#1A1A1A" />
            </button>
          </div>

          {/* STATS ROW */}
          <div
            style={{
              background: 'rgba(169, 169, 169, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {[
              { label: 'Смен закрыто', value: '132', icon: CheckCircle, color: '#BFFF00' },
              { label: 'Моя ставка', value: '3 500 ₽', icon: Wallet, color: '#E85D2F' },
              { label: 'Рейтинг', value: '4.8', icon: Star, color: '#FFD60A' },
            ].map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: `rgba(${stat.color === '#BFFF00' ? '191, 255, 0' : stat.color === '#E85D2F' ? '232, 93, 47' : '255, 214, 10'}, 0.15)`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon === CheckCircle && <CheckCircle size={16} color={stat.color} />}
                  {stat.icon === Wallet && <Wallet size={16} color={stat.color} />}
                  {stat.icon === Star && <Star size={16} fill={stat.color} color={stat.color} />}
                </div>
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: '20px',
                    color: '#FFFFFF',
                    letterSpacing: '-0.3px',
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* MY CREW SECTION */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Моя бригада
              </h2>
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#FFFFFF',
                }}
              >
                {workersOnSite}/4 на объекте
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {crewMembers.map((worker) => (
                <div
                  key={worker.id}
                  style={{
                    background: 'rgba(169, 169, 169, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    gap: '14px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left border accent */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background:
                        worker.status === 'on_site'
                          ? '#BFFF00'
                          : worker.status === 'pending'
                            ? '#FFD60A'
                            : '#FF4444',
                      borderRadius: '14px 0 0 14px',
                    }}
                  />

                  {/* Avatar */}
                  <div
                    style={{
                      position: 'relative',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(232, 93, 47, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                        background:
                          worker.status === 'on_site'
                            ? '#BFFF00'
                            : worker.status === 'pending'
                              ? '#FFD60A'
                              : '#FF4444',
                        border: '2px solid #2A2A2A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {worker.status === 'on_site' && <CheckCircle size={12} color="#1A1A1A" />}
                      {worker.status === 'pending' && <Clock size={12} color="#1A1A1A" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    {/* Header row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '15px',
                          color: '#FFFFFF',
                          margin: 0,
                        }}
                      >
                        {worker.name}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(191, 255, 0, 0.15)',
                            border: '1px solid #BFFF00',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Phone size={14} color="#BFFF00" />
                        </button>
                        {worker.status === 'on_site' && (
                          <button
                            style={{
                              width: '32px',
                              height: '32px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: 'none',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <ImageIcon size={14} color="#FFFFFF" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role & rating row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
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
                      <div style={{ display: 'flex', gap: '3px' }}>
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
                    </div>

                    {/* Status row */}
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '5px',
                        alignItems: 'center',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.5px',
                        background:
                          worker.status === 'on_site'
                            ? 'rgba(191, 255, 0, 0.15)'
                            : worker.status === 'pending'
                              ? 'rgba(255, 214, 10, 0.15)'
                              : 'rgba(255, 68, 68, 0.15)',
                        border:
                          worker.status === 'on_site'
                            ? '1px solid #BFFF00'
                            : worker.status === 'pending'
                              ? '1px solid #FFD60A'
                              : '1px solid #FF4444',
                        color:
                          worker.status === 'on_site'
                            ? '#BFFF00'
                            : worker.status === 'pending'
                              ? '#FFD60A'
                              : '#FF4444',
                      }}
                    >
                      <MapPin size={10} />
                      {worker.status === 'on_site'
                        ? 'НА ОБЪЕКТЕ'
                        : worker.status === 'pending'
                          ? 'ОЖИДАЕТ'
                          : 'ПРОБЛЕМА'}
                    </div>
                    {worker.checkInTime && (
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 500,
                          fontSize: '11px',
                          color: '#FFFFFF',
                          marginTop: '6px',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <Check size={10} />
                        Вышел в {worker.checkInTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                margin: '0 0 14px 0',
              }}
            >
              Быстрые действия
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
              }}
            >
              {[
                {
                  icon: CheckSquare,
                  label: 'Подтвердить всех',
                  subtitle: 'Check-in',
                  color: '#BFFF00',
                },
                { icon: Camera, label: 'Запросить фото', subtitle: 'От бригады', color: '#E85D2F' },
                {
                  icon: AlertTriangle,
                  label: 'Проблема',
                  subtitle: 'Сообщить',
                  color: '#FF4444',
                },
                { icon: FileText, label: 'Список бригады', subtitle: 'Экспорт', color: '#FFFFFF' },
              ].map((action, idx) => (
                <button
                  key={idx}
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
                    e.currentTarget.style.background = 'rgba(169, 169, 169, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(169, 169, 169, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      background: `rgba(${action.color === '#BFFF00' ? '191, 255, 0' : action.color === '#E85D2F' ? '232, 93, 47' : action.color === '#FF4444' ? '255, 68, 68' : '155, 155, 155'}, 0.15)`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <action.icon size={18} color={action.color} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        margin: '2px 0',
                      }}
                    >
                      {action.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: '#FFFFFF',
                        margin: 0,
                      }}
                    >
                      {action.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* WORK ACCEPTANCE */}
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                margin: '0 0 14px 0',
              }}
            >
              Приемка работ
            </h2>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              {checklist.map((item, idx) => (
                <div key={item.id}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px 0',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleChecklist(item.id)}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        background: item.checked ? '#BFFF00' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.checked && <Check size={14} color="#1A1A1A" />}
                    </div>
                    <label
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </label>
                  </div>
                  {idx < checklist.length - 1 && (
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleConfirmWork}
                disabled={!allChecked}
                style={{
                  width: '100%',
                  height: '48px',
                  background: allChecked ? '#BFFF00' : 'rgba(191, 255, 0, 0.3)',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#1A1A1A',
                  cursor: allChecked ? 'pointer' : 'not-allowed',
                  marginTop: '16px',
                  boxShadow: allChecked ? '0 4px 16px rgba(191, 255, 0, 0.4)' : 'none',
                  opacity: allChecked ? 1 : 0.5,
                }}
              >
                <CheckCircle size={18} color="#1A1A1A" />
                Подтвердить выполнение
              </button>
            </div>
          </div>
        </div>

        {/* RATING MODAL */}
        {showRatingModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
            }}
            onClick={() => setShowRatingModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '390px',
                background: '#2A2A2A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px 20px 0 0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  Оцените работу бригады
                </h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#FFFFFF',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                  margin: '0 0 20px 0',
                }}
              >
                Ваша оценка влияет на рейтинг исполнителей
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                {crewMembers.slice(0, 3).map((worker) => (
                  <div key={worker.id} style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(232, 93, 47, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <User size={20} color="#E85D2F" />
                        </div>
                        <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#FFFFFF',
                            margin: 0,
                          }}
                        >
                          {worker.name}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatings({ ...ratings, [worker.id]: star })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Star
                            size={20}
                            fill={star <= (ratings[worker.id] || 0) ? '#FFD60A' : '#FFFFFF'}
                            color={star <= (ratings[worker.id] || 0) ? '#FFD60A' : '#FFFFFF'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите качество работы..."
                  style={{
                    width: '100%',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '13px',
                    color: '#FFFFFF',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowRatingModal(false)}
                  style={{
                    flex: 1,
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Пропустить
                </button>
                <button
                  onClick={handleRateSubmit}
                  style={{
                    flex: 1,
                    height: '48px',
                    background: '#E85D2F',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(232, 93, 47, 0.4)',
                  }}
                >
                  <Send size={16} />
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
