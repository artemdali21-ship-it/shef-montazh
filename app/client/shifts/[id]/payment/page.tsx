'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Clock, User, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { getShiftById } from '@/lib/api/shifts'
import { getPaymentByShift } from '@/lib/api/payments'
import PaymentButton from '@/components/payments/PaymentButton'
import PaymentBreakdown from '@/components/payments/PaymentBreakdown'

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const supabase = createClient()

  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [worker, setWorker] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [existingPayment, setExistingPayment] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadData()
  }, [shiftId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    }
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get shift details
      const { data: shiftData, error: shiftError } = await getShiftById(shiftId)
      if (shiftError) throw shiftError

      if (!shiftData) {
        toast.error('Смена не найдена')
        router.back()
        return
      }

      // Verify user is the client
      if (shiftData.client_id !== user.id) {
        toast.error('У вас нет доступа к этой странице')
        router.back()
        return
      }

      setShift(shiftData)

      // Get worker details
      const { data: shiftWorker } = await supabase
        .from('shift_workers')
        .select(`
          *,
          worker:users(
            id,
            full_name,
            avatar_url,
            phone,
            rating
          )
        `)
        .eq('shift_id', shiftId)
        .eq('status', 'completed')
        .single()

      if (shiftWorker) {
        setWorker(shiftWorker.worker)
      }

      // Check if payment already exists
      const { data: payment } = await getPaymentByShift(shiftId)
      if (payment) {
        setExistingPayment(payment)

        // If already paid, redirect to success page
        if (payment.status === 'succeeded') {
          router.push(`/payments/success?shift_id=${shiftId}`)
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error(error.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Смена не найдена</p>
          <button
            onClick={() => router.back()}
            className="text-orange-400 hover:text-orange-300"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  const platformFee = 1200
  const workerAmount = shift.pay_amount || 0
  const totalAmount = workerAmount + platformFee

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Оплата смены</h1>
            <p className="text-sm text-gray-400">Завершите оплату исполнителю</p>
          </div>
        </div>

        {/* Existing Payment Warning */}
        {existingPayment && existingPayment.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium mb-1">Ожидается оплата</p>
              <p className="text-yellow-400/70 text-sm">
                Платёж уже создан, но ещё не завершён. Нажмите кнопку ниже для продолжения оплаты.
              </p>
            </div>
          </div>
        )}

        {/* Shift Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Информация о смене</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Дата и время</p>
                <p className="text-white font-medium">
                  {formatDate(shift.date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Локация</p>
                <p className="text-white font-medium">{shift.location_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Название</p>
                <p className="text-white font-medium">{shift.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Info */}
        {worker && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Исполнитель</h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {worker.avatar_url ? (
                  <img
                    src={worker.avatar_url}
                    alt={worker.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{worker.full_name}</p>
                <p className="text-sm text-gray-400">{worker.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="mb-6">
          <PaymentBreakdown
            workerAmount={workerAmount}
            platformFee={platformFee}
            workerName={worker?.full_name}
          />
        </div>

        {/* Payment Button */}
        {(!existingPayment || existingPayment.status === 'pending') && (
          <PaymentButton
            shiftId={shiftId}
            workerId={worker?.id || ''}
            amount={totalAmount}
            disabled={!worker}
          />
        )}

        {existingPayment && existingPayment.status === 'succeeded' && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <p className="text-green-400 font-medium">✓ Оплата уже завершена</p>
          </div>
        )}
      </div>
    </div>
  )
}
