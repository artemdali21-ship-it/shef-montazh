'use client'

import { useState } from 'react'
import { CreditCard, Loader2, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface Props {
  shiftId: string
  workerId: string
  amount: number
  disabled?: boolean
}

export default function PaymentButton({ shiftId, workerId, amount, disabled = false }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (loading || disabled) return

    setLoading(true)

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          workerId,
          amount,
          description: `Оплата смены #${shiftId}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      if (data.confirmationUrl) {
        toast.success('Перенаправление на страницу оплаты...')
        // Redirect to YooKassa payment page
        setTimeout(() => {
          window.location.href = data.confirmationUrl
        }, 500)
      } else {
        throw new Error('No confirmation URL received')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Не удалось создать платёж')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition shadow-lg shadow-green-500/30 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Оплатить {amount.toLocaleString('ru-RU')} ₽
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Shield className="w-4 h-4" />
        <span>Безопасная оплата через ЮКасса</span>
      </div>
    </div>
  )
}
