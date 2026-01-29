'use client'

import { useState } from 'react'
import { ArrowLeft, Share2, Send, Calendar, MapPin, HardHat, Wrench, Shield, Clock, Star, Lock, CheckCircle, Wallet, AlertCircle, Eye, Phone, Flag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'
import { CompletionActions } from './shift/CompletionActions'
import { RatingModal } from './rating/RatingModal'
import { PaymentSection } from './PaymentSection'
import { WorkerStatusList } from './monitoring/WorkerStatusList'

const JobDetailsScreen = () => {
  const router = useRouter()
  const [isApplying, setIsApplying] = useState(false)
  const [shiftStatus, setShiftStatus] = useState<'checked_in' | 'awaiting_worker_confirm' | 'awaiting_rating' | 'completed'>('completed')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [userRole] = useState<'client' | 'worker'>('client')
  const [isPaid, setIsPaid] = useState(false)

  const jobDetails = {
    id: 1,
    title: 'Монтаж выставочного стенда',
    rate: 2500,
    currency: '₽',
    duration: '8 часов',
    date: '28 января',
    time: '18:00 - 02:00',
    fullDateTime: '28 января, 18:00 - 02:00',
    location: 'Крокус Экспо, павильон 3',
    address: 'Москва, Красногорск',
    category: 'Монтаж и сборка',
    categoryDetail: 'Требуется опыт работы',
    urgent: true,
    verified: true,
    description: 'Требуется монтаж выставочного стенда площадью 36 кв.м. Работа включает сборку алюминиевых ферм, установку панелей, подключение освещения. Проект под ключ с последующим демонтажом через 3 дня.',
    workerId: 'worker-123',
    platformFeePercent: 2.5, // 2.5% commission
  }

  const platformFee = Math.round(jobDetails.rate * (jobDetails.platformFeePercent / 100))
  const totalAmount = jobDetails.rate + platformFee

  const infoCards = [
    {
      icon: Calendar,
      title: 'ДАТА И ВРЕМЯ',
      value: jobDetails.fullDateTime,
      detail: `Продолжительность: ${jobDetails.duration}`,
    },
    {
      icon: MapPin,
      title: 'ЛОКАЦИЯ',
      value: jobDetails.location,
      detail: jobDetails.address,
    },
    {
      icon: HardHat,
      title: 'КАТЕГОРИЯ',
      value: jobDetails.category,
      detail: jobDetails.categoryDetail,
    },
  ]

  const requirements = [
    { icon: Wrench, text: 'Свой инструмент (шуруповерт, уровень)' },
    { icon: Shield, text: 'Спецодежда и средства защиты' },
    { icon: Clock, text: 'Готовность к ночной работе' },
    { icon: Star, text: 'Опыт монтажа от 1 года' },
  ]

  // Mock workers data for monitoring
  const assignedWorkers = [
    {
      id: 'w1',
      name: 'Иван Петров',
      avatar: '/placeholder-user.jpg',
      status: 'checked_in' as const,
      checkInTime: '17:58',
      checkInPhoto: '/placeholder.jpg',
      lateMinutes: 0,
    },
    {
      id: 'w2',
      name: 'Сергей Иванов',
      avatar: '/placeholder-user.jpg',
      status: 'on_way' as const,
      lateMinutes: 5,
    },
    {
      id: 'w3',
      name: 'Дмитрий Сидоров',
      avatar: '/placeholder-user.jpg',
      status: 'assigned' as const,
    },
  ]

  const handleCompleteShift = () => {
    setShiftStatus('awaiting_worker_confirm')
    console.log('[v0] Client completed shift')
  }

  const handleWorkerConfirm = () => {
    setShiftStatus('awaiting_rating')
    console.log('[v0] Worker confirmed completion')
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      setShiftStatus('completed')
      console.log('[v0] Rating submitted:', { rating, comment })
      // TODO: Save rating to database
      setShowRatingModal(false)
    } catch (error) {
      console.error('[v0] Error submitting rating:', error)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col overflow-hidden">
      {/* HEADER */}
      <Header 
        title="Детали смены" 
        showBack={true} 
        showShare={true}
        onBack={() => router.back()}
      />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-scroll px-4 pt-4 pb-24 w-full" data-allow-scroll>
        {/* HERO SECTION - ТОЛЬКО ЗДЕСЬ ОРАНЖЕВЫЙ ГРАДИЕНТ */}
        <section
          style={{
            background: 'linear-gradient(135deg, #E85D2F 0%, #D94D1F 100%)',
            padding: '24px 20px',
            borderRadius: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(232, 93, 47, 0.3)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {jobDetails.urgent && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
              >
                Срочно
              </div>
            )}
            {jobDetails.verified && (
              <div
                className="flex items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
              >
                <CheckCircle size={12} color="#FFFFFF" />
                Проверено
              </div>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '16px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            {jobDetails.title}
          </h1>

          {/* Rate */}
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
                fontFamily: 'Montserrat, system-ui, sans-serif',
              }}
            >
              {jobDetails.rate} {jobDetails.currency}
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.85)',
                marginTop: '4px',
                fontFamily: 'Montserrat, system-ui, sans-serif',
              }}
            >
              за смену ({jobDetails.duration})
            </div>
          </div>
        </section>

        {/* INFO CARDS */}
        <section style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {infoCards.map((card, idx) => {
            const IconComponent = card.icon
            return (
              <div
                key={idx}
                className="transition-all cursor-pointer"
                style={{
                  background: 'rgba(245, 245, 245, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  gap: '14px',
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
                {/* Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(232, 93, 47, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={22} color="#E85D2F" />
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#9B9B9B',
                      letterSpacing: '1px',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      marginBottom: '4px',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#6B6B6B',
                      lineHeight: 1.4,
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                  >
                    {card.detail}
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* REQUIREMENTS SECTION */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '16px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Требования
          </h2>
          <div
            style={{
              background: 'rgba(245, 245, 245, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            {requirements.map((req, idx) => {
              const IconComponent = req.icon
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: idx !== requirements.length - 1 ? '16px' : 0,
                    alignItems: 'flex-start',
                  }}
                >
                  <IconComponent size={20} color="#E85D2F" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#FFFFFF',
                      lineHeight: 1.6,
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                  >
                    {req.text}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* LIVE MONITORING SECTION - Show when shift is in_progress and user is client */}
        {userRole === 'client' && (shiftStatus === 'checked_in' || shiftStatus === 'awaiting_worker_confirm') && (
          <section style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Eye size={18} color="#E85D2F" />
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
              >
                Мониторинг смены
              </h2>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: 'auto',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>В РЕЖИМЕ</span>
              </div>
            </div>

            {/* Worker Status List */}
            <div style={{ marginBottom: '16px' }}>
              <WorkerStatusList
                workers={assignedWorkers}
                shiftStartTime="18:00"
              />
            </div>

            {/* Cost Info Card - NO ESCROW */}
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '13px', color: '#FFFFFF' }}>
                  К оплате после завершения:
                </span>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '14px', color: '#BFFF00' }}>
                  {jobDetails.rate * assignedWorkers.length} ₽
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#FFFFFF', opacity: 0.6 }}>
                {assignedWorkers.length} чел. × {jobDetails.rate} ₽
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => console.log('[v0] Call workers')}
                style={{
                  height: '44px',
                  background: 'rgba(232, 93, 47, 0.15)',
                  border: '1px solid rgba(232, 93, 47, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#E85D2F',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 93, 47, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 93, 47, 0.15)'
                }}
              >
                <Phone size={16} />
                Позвонить
              </button>
              <button
                onClick={() => console.log('[v0] Report issue')}
                style={{
                  height: '44px',
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#DC2626',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)'
                }}
              >
                <Flag size={16} />
                Пожаловаться
              </button>
            </div>
          </section>
        )}

        {/* COMPLETION ACTIONS SECTION */}
        <CompletionActions
          shiftStatus={shiftStatus}
          userRole={userRole}
          onCompleteShift={handleCompleteShift}
          onConfirmCompletion={handleWorkerConfirm}
          onRatingOpen={() => setShowRatingModal(true)}
        />

        {/* PAYMENT SECTION - Show only for Client after completion and rating */}
        {userRole === 'client' && shiftStatus === 'completed' && !isPaid && (
          <PaymentSection
            shiftId={`${jobDetails.id}`}
            workerId={jobDetails.workerId}
            workerAmount={jobDetails.rate}
            platformFee={platformFee}
            totalAmount={totalAmount}
            onPaymentSuccess={() => {
              setIsPaid(true)
              console.log('[v0] Payment successful')
            }}
            onPaymentError={(error) => {
              console.error('[v0] Payment error:', error)
            }}
          />
        )}

        {/* DESCRIPTION SECTION */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '16px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Описание
          </h2>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#FFFFFF',
                lineHeight: 1.7,
                fontFamily: 'Montserrat, system-ui, sans-serif',
              }}
            >
              {jobDetails.description}
            </p>
          </div>
        </section>

        {/* PAYMENT CONDITIONS SECTION */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '16px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Условия оплаты
          </h2>
          <div
            style={{
              background: 'rgba(255, 214, 10, 0.1)',
              border: '1px solid rgba(255, 214, 10, 0.2)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Wallet size={18} color="#FFD60A" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, system-ui, sans-serif' }}>
                Как происходит оплата
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '13px', color: '#9B9B9B' }}>Ставка</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>2,500 ₽</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '13px', color: '#9B9B9B' }}>Способ оплаты</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>По договоренности</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9B9B9B' }}>Возможно через СЗ</span>
              <CheckCircle size={16} color="#BFFF00" />
            </div>

            <div style={{ background: 'rgba(255, 214, 10, 0.1)', border: '1px solid rgba(255, 214, 10, 0.2)', borderRadius: '12px', padding: '12px', marginTop: '16px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={14} color="#FFD60A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: 'Montserrat, system-ui, sans-serif', lineHeight: 1.5 }}>
                Оплата производится напрямую заказчиком после выполнения работ. Платформа не участвует в денежных расчетах.
              </p>
            </div>
          </div>
        </section>

        {/* ESCROW SECTION */}
        <section style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.3,
              marginBottom: '10px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Средства защищены эскроу-счётом
          </h3>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.6,
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Оплата гарантирована. Деньги заморожены до подтверждения выполнения работ. Страховая компенсация 150% при срыве.
          </p>
        </section>
      </div>

      {/* FIXED CTA BUTTON AT BOTTOM */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        right: '20px',
        background: 'rgba(26, 26, 26, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 0',
        zIndex: 30,
        maxWidth: 'calc(100% - 40px)',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => {
            router.push(`/application?jobId=${jobDetails.id}`)
            console.log(`[v0] Applying to job ${jobDetails.id}`)
          }}
          disabled={isApplying}
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '52px',
            background: '#E85D2F',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '16px',
            border: 'none',
            cursor: isApplying ? 'not-allowed' : 'pointer',
            opacity: isApplying ? 0.7 : 1,
            transition: 'all 0.3s',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            if (!isApplying) (e.target as HTMLButtonElement).style.background = '#D94D1F'
          }}
          onMouseLeave={(e) => {
            if (!isApplying) (e.target as HTMLButtonElement).style.background = '#E85D2F'
          }}
        >
          {isApplying ? 'Отправка...' : 'Откликнуться'}
        </button>
      </div>

      {/* RATING MODAL */}
      <RatingModal
        isOpen={showRatingModal}
        shiftId={`${jobDetails.id}`}
        ratedUserId="worker-123"
        ratedUserName="Иван Петров"
        ratedUserRole="worker"
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  )
}

export default JobDetailsScreen
