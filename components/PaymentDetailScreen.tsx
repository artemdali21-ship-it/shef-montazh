'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  HelpCircle,
  Building2,
  Calendar,
  Shield,
  Lock,
  CheckCircle,
  Zap,
  XCircle,
  User,
  Percent,
  Info,
  Send,
  MapPin,
  Clock,
  UserCheck,
  Wallet,
  CreditCard,
  Edit2,
  Receipt,
  FileText,
  Download,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Header } from './Header';

export default function PaymentDetailScreen() {
  const [activeStatus] = useState('current');

  const paymentData = {
    shift: {
      id: 1,
      title: 'Монтаж выставочного стенда',
      company: 'Decor Factory',
      date: '28 января 2026',
    },
    amount: {
      worker: 2500,
      commission: 300,
      total: 2800,
    },
    status: 'current',
  };

  const timeline = [
    {
      id: 1,
      status: 'completed',
      title: 'Вы откликнулись',
      description: 'Заявка отправлена заказчику',
      timestamp: '27 января, 14:30',
      icon: Send,
    },
    {
      id: 2,
      status: 'completed',
      title: 'Заявка одобрена',
      description: 'Вас выбрали для выполнения работ',
      timestamp: '27 января, 14:45',
      icon: CheckCircle,
    },
    {
      id: 3,
      status: 'completed',
      title: 'Вы вышли на объект',
      description: 'Check-in подтверждён фотографией',
      timestamp: '27 января, 16:20',
      icon: MapPin,
    },
    {
      id: 4,
      status: 'current',
      title: 'Смена в процессе',
      description: 'Ожидается завершение работ',
      timestamp: 'Сейчас',
      icon: Clock,
    },
    {
      id: 5,
      status: 'pending',
      title: 'Подтверждение шефа',
      description: 'Шеф-монтажник должен принять работу',
      timestamp: 'Ожидается',
      icon: UserCheck,
    },
    {
      id: 6,
      status: 'pending',
      title: 'Взаимная оценка',
      description: 'Вы оцениваете работу друг друга',
      timestamp: 'После завершения',
      icon: CheckCircle,
    },
    {
      id: 7,
      status: 'pending',
      title: 'Выплата',
      description: 'Средства поступят на ваш счёт',
      timestamp: 'После оценки',
      icon: Wallet,
    },
  ];

  const documents = [
    {
      id: 1,
      type: 'Чек для самозанятого',
      status: 'Будет сформирован после выплаты',
      icon: Receipt,
      available: false,
    },
    {
      id: 2,
      type: 'Акт выполненных работ',
      status: 'Будет доступен после подтверждения',
      icon: FileText,
      available: false,
    },
    {
      id: 3,
      type: 'История транзакций',
      status: 'Скачать PDF',
      icon: Download,
      available: true,
    },
  ];

  const statusStyles = {
    pending: {
      bg: 'rgba(232, 93, 47, 0.15)',
      border: '#E85D2F',
      color: '#E85D2F',
      text: 'ОЖИДАЕТСЯ',
    },
    approved: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: '#3B82F6',
      color: '#3B82F6',
      text: 'ОДОБРЕНО',
    },
    current: {
      bg: 'rgba(232, 93, 47, 0.15)',
      border: '#E85D2F',
      color: '#E85D2F',
      text: 'В ПРОЦЕССЕ',
    },
    released: {
      bg: 'rgba(191, 255, 0, 0.15)',
      border: '#BFFF00',
      color: '#BFFF00',
      text: 'ВЫПЛАЧЕНО',
    },
  };

  const currentStatus = statusStyles[paymentData.status] || statusStyles.current;

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
      {/* PAYMENT 3D ELEMENTS - BOLTS AND HELMET */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <img src="/images/bolts.png" className="absolute top-20 right-10 w-20 h-20" alt="" />
        <img src="/images/helmet-silver.png" className="absolute bottom-1/4 left-8 w-36 h-36" style={{animation: 'float 8s ease-in-out infinite 1.2s', transform: 'rotate(-15deg)'}} alt="" />
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
      {/* FLOATING CONCRETE - бетон 8 */}
      <img
        src="/images/concrete-8.png"
        alt=""
        style={{
          position: 'fixed',
          top: '10%',
          left: '3%',
          width: '96px',
          height: 'auto',
          opacity: 0.08,
          transform: 'rotate(-12deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* FLOATING SCREWDRIVER DOUBLE - Payment (right bottom) */}
      <img
        src="/images/screwdriver-double.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '15%',
          right: '3%',
          width: '72px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(10deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 0.8s',
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
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '16px',
            zIndex: 50,
          }}
        >
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
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
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
              margin: 0,
            }}
          >
            Детали выплаты
          </h1>

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
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <HelpCircle size={18} color="#FFFFFF" />
          </button>
        </header>

        {/* MAIN CONTENT */}
        <div style={{ paddingTop: '80px', paddingBottom: '120px', overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
          {/* SHIFT INFO HEADER */}
          <div style={{ padding: '20px' }}>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: '#FFFFFF',
                margin: '0 0 8px 0',
              }}
            >
              {paymentData.shift.title}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Building2 size={14} color="#E85D2F" />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#E0E0E0',
                  }}
                >
                  {paymentData.shift.company}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Calendar size={14} color="#9B9B9B" />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#E0E0E0',
                  }}
                >
                  {paymentData.shift.date}
                </span>
              </div>
            </div>
          </div>

          {/* AMOUNT CARD */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  gap: '6px',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: currentStatus.bg,
                  border: `1px solid ${currentStatus.border}`,
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentStatus.color,
                    animation:
                      paymentData.status === 'current'
                        ? 'pulse 2s ease-in-out infinite'
                        : 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    color: currentStatus.color,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentStatus.text}
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#E0E0E0',
                  marginBottom: '8px',
                }}
              >
                СУММА К ПОЛУЧЕНИЮ
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '36px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {paymentData.amount.worker.toLocaleString('ru-RU')} ₽
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                Ваша ставка за 8-часовую смену
              </div>
            </div>
          </div>

          {/* ESCROW BREAKDOWN */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <Shield size={20} color="#BFFF00" />
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Разбивка эскроу
              </h3>
            </div>
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
              {/* Payment to worker */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={16} color="#FFFFFF" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    Оплата исполнителю
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#FFFFFF',
                  }}
                >
                  {paymentData.amount.worker.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Commission */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(232, 93, 47, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Percent size={16} color="#E85D2F" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    Комиссия платформы (12%)
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#E85D2F',
                  }}
                >
                  {paymentData.amount.commission.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0 0 0',
                  marginTop: '8px',
                  borderTop: '2px solid rgba(191, 255, 0, 0.2)',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(191, 255, 0, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Shield size={16} color="#BFFF00" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '15px',
                      color: '#FFFFFF',
                    }}
                  >
                    Итого заблокировано
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#BFFF00',
                  }}
                >
                  {paymentData.amount.total.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Info box */}
              <div
                style={{
                  marginTop: '16px',
                  background: 'rgba(191, 255, 0, 0.08)',
                  border: '1px solid rgba(191, 255, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <Info size={16} color="#BFFF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#E0E0E0',
                    lineHeight: '1.5',
                  }}
                >
                  Средства будут переведены на ваш счёт после подтверждения выполнения работ
                  шеф-монтажником
                </span>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
                margin: 0,
              }}
            >
              История транзакции
            </h3>
            <div style={{ marginTop: '14px', position: 'relative' }}>
              {timeline.map((item, idx) => {
                const IconComponent = item.icon;
                const isCompleted = item.status === 'completed';
                const isCurrent = item.status === 'current';
                const isPending = item.status === 'pending';

                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      paddingLeft: '48px',
                      paddingBottom: idx === timeline.length - 1 ? 0 : '24px',
                    }}
                  >
                    {/* Timeline line */}
                    {idx !== timeline.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '19px',
                          top: '32px',
                          bottom: 0,
                          width: '2px',
                          background: isPending
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'linear-gradient(180deg, #BFFF00 0%, rgba(191, 255, 0, 0.2) 100%)',
                        }}
                      />
                    )}

                    {/* Icon circle */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCompleted
                          ? 'rgba(191, 255, 0, 0.15)'
                          : isCurrent
                            ? 'rgba(232, 93, 47, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: isCompleted
                          ? '2px solid #BFFF00'
                          : isCurrent
                            ? '2px solid #E85D2F'
                            : '2px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                        animation: isCurrent ? 'pulse-ring 2s ease-out infinite' : 'none',
                      }}
                    >
                      <IconComponent
                        size={18}
                        color={
                          isCompleted
                            ? '#BFFF00'
                            : isCurrent
                              ? '#E85D2F'
                              : '#6B6B6B'
                        }
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h4
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '15px',
                          color: isCompleted || isCurrent ? '#FFFFFF' : '#6B6B6B',
                          margin: '0 0 4px 0',
                        }}
                      >
                        {item.title}
                      </h4>
                      <p
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 400,
                          fontSize: '13px',
                          color: '#E0E0E0',
                          lineHeight: '1.4',
                          margin: '0 0 6px 0',
                        }}
                      >
                        {item.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 500,
                          fontSize: '11px',
                          color: '#FFFFFF',
                        }}
                      >
                        <Clock size={10} />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
                margin: 0,
              }}
            >
              Способ выплаты
            </h3>
            <div
              style={{
                marginTop: '14px',
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(232, 93, 47, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={24} color="#E85D2F" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#FFFFFF',
                    marginBottom: '4px',
                  }}
                >
                  Банковская карта
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#E0E0E0',
                  }}
                >
                  •••• 4729
                </div>
              </div>
              <button
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <Edit2 size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>

          {/* DOCUMENTS */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
                margin: 0,
              }}
            >
              Документы
            </h3>
            <div style={{ marginTop: '14px' }}>
              {documents.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: 'rgba(169, 169, 169, 0.2)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      marginBottom: '10px',
                      opacity: doc.available ? 1 : 0.6,
                      cursor: doc.available ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (doc.available) {
                        e.currentTarget.style.background = 'rgba(169, 169, 169, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(169, 169, 169, 0.2)';
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: doc.available
                          ? 'rgba(232, 93, 47, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent
                        size={20}
                        color={doc.available ? '#E85D2F' : '#CCCCCC'}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#FFFFFF',
                          marginBottom: '4px',
                        }}
                      >
                        {doc.type}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 400,
                          fontSize: '12px',
                          color: doc.available ? '#BFFF00' : '#9B9B9B',
                        }}
                      >
                        {doc.status}
                      </div>
                    </div>
                    {doc.available && <ChevronRight size={20} color="#9B9B9B" />}
                  </div>
                );
              })}
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
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
            padding: '16px 20px 28px 20px',
            zIndex: 40,
            maxWidth: '390px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontSize: '11px',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            Возникли вопросы по выплате?
          </div>
          <button
            style={{
              width: '100%',
              height: '52px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <MessageCircle size={18} />
            Связаться с поддержкой
          </button>
        </div>

        {/* ANIMATIONS */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(232, 93, 47, 0.4); }
            100% { box-shadow: 0 0 0 12px rgba(232, 93, 47, 0); }
          }
        `}</style>
      </div>
    </div>
  );
}
