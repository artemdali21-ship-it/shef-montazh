'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface PaymentSectionProps {
  shiftId: string
  workerId: string
  workerAmount: number
  platformFee: number
  totalAmount: number
  onPaymentSuccess?: () => void
  onPaymentError?: (error: string) => void
}

export const PaymentSection = ({
  shiftId,
  workerId,
  workerAmount,
  platformFee,
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
}: PaymentSectionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [transactionId, setTransactionId] = useState('')

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      // Call payment API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shiftId,
          workerId,
          amount: totalAmount,
          description: `Оплата за смену #${shiftId}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setPaymentStatus('success')
        setTransactionId(data.transactionId)
        onPaymentSuccess?.()

        // Redirect to ЮKassa payment page
        if (data.paymentUrl) {
          setTimeout(() => {
            window.location.href = data.paymentUrl
          }, 2000)
        }
      } else {
        throw new Error(data.message || 'Payment failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      setPaymentStatus('error')
      setErrorMessage(message)
      onPaymentError?.(message)
      console.error('[v0] Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (paymentStatus === 'success') {
    return (
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle size={48} color="#10B981" />
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '8px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            ✅ Оплата прошла успешно!
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#E0E0E0',
              marginBottom: '12px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Исполнитель получит средства в течение 24 часов
          </p>
          {transactionId && (
            <p
              style={{
                fontSize: '12px',
                color: '#9B9B9B',
                fontFamily: 'Montserrat, system-ui, sans-serif',
              }}
            >
              ID транзакции: {transactionId}
            </p>
          )}
        </div>
      </section>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '4px',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
              >
                Ошибка при оплате
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#E0E0E0',
                  marginBottom: '16px',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
              >
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentStatus('idle')}
            style={{
              background: '#EF4444',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Попробовать еще раз
          </button>
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: '24px' }}>
      {/* AMOUNT BREAKDOWN CARD */}
      <div
        style={{
          background: 'rgba(245, 245, 245, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '16px',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          Оплата за смену
        </h3>

        {/* Worker Amount */}
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
            {workerAmount.toLocaleString('ru-RU')} ₽
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#9B9B9B',
              marginTop: '4px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Сумма для исполнителя
          </div>
        </div>

        {/* Platform Fee */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#9B9B9B',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            + Комиссия платформы
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#E85D2F',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            {platformFee.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Итого к оплате
          </span>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#BFFF00',
              letterSpacing: '-0.5px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            {totalAmount.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* PAYMENT BUTTON */}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        style={{
          width: '100%',
          height: '56px',
          background: isLoading ? '#059669' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.3s',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          opacity: isLoading ? 0.8 : 1,
          marginBottom: '12px',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            (e.target as HTMLButtonElement).style.transform = 'scale(1.02)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            (e.target as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)'
          }
        }}
      >
        {isLoading ? (
          <>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Обработка...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Оплатить {totalAmount.toLocaleString('ru-RU')} ₽
          </>
        )}
      </button>

      {/* PAYMENT INFO */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px 0',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9B9B9B',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          💳 Оплата через ЮKassa
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#9B9B9B',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          🔒 Безопасная транзакция
        </div>
      </div>
    </section>
  )
}
