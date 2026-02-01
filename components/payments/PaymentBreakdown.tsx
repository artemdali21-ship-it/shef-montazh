'use client'

import { DollarSign, TrendingDown, ArrowRight } from 'lucide-react'

interface Props {
  workerAmount: number
  platformFee: number
  workerName?: string
}

export default function PaymentBreakdown({ workerAmount, platformFee, workerName }: Props) {
  const total = workerAmount + platformFee
  const feePercentage = ((platformFee / total) * 100).toFixed(1)

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-orange-400" />
        Детали оплаты
      </h3>

      <div className="space-y-4">
        {/* Worker Amount */}
        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div>
            <p className="text-sm text-blue-400/70 mb-1">
              {workerName ? `Исполнителю: ${workerName}` : 'Исполнителю'}
            </p>
            <p className="text-2xl font-bold text-white">
              {workerAmount.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        {/* Platform Fee */}
        <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div>
            <p className="text-sm text-orange-400/70 mb-1">
              Комиссия платформы ({feePercentage}%)
            </p>
            <p className="text-lg font-semibold text-white">
              {platformFee.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-4"></div>

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
          <div>
            <p className="text-sm text-green-400/70 mb-1">Итого к оплате</p>
            <p className="text-3xl font-bold text-green-400">
              {total.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-400 leading-relaxed">
          💳 Средства будут перечислены исполнителю в течение 24 часов после успешной оплаты
        </p>
      </div>
    </div>
  )
}
