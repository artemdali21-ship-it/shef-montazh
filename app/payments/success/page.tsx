'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Download, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getPaymentByShift } from '@/lib/api/payments'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const shiftId = searchParams.get('shift_id')

  const [payment, setPayment] = useState<any>(null)
  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (shiftId) {
      loadPaymentDetails()
    }
  }, [shiftId])

  const loadPaymentDetails = async () => {
    try {
      if (!shiftId) return

      // Get payment details
      const { data: paymentData } = await getPaymentByShift(shiftId)
      setPayment(paymentData)

      // Get shift details
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single()

      setShift(shiftData)
    } catch (error) {
      console.error('Error loading payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center mb-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={40} className="text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Оплата прошла успешно! 🎉
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-6 leading-relaxed">
            Средства будут перечислены исполнителю в течение 24 часов
          </p>

          {/* Payment Details */}
          {payment && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-400/70 mb-2">Сумма оплаты</p>
              <p className="text-3xl font-bold text-blue-400">
                {payment.amount?.toLocaleString('ru-RU')} ₽
              </p>
              {payment.yukassa_payment_id && (
                <p className="text-xs text-gray-500 mt-2">
                  ID транзакции: {payment.yukassa_payment_id.slice(0, 16)}...
                </p>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-400 leading-relaxed">
              📧 Чек был отправлен на вашу электронную почту
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {shiftId && (
            <Link
              href={`/shifts/${shiftId}`}
              className="block w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-center transition flex items-center justify-center gap-2"
            >
              <span>Вернуться к смене</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <Link
            href="/shifts"
            className="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium text-center transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>На главную</span>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Есть вопросы?{' '}
            <a href="mailto:support@shef-montazh.ru" className="text-orange-400 hover:text-orange-300">
              Написать в поддержку
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
