'use client'

import { useState } from 'react'
import { X, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function BlockDatesModal({ onClose, onSuccess }: Props) {
  const supabase = createClient()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert('Выберите даты')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('Дата окончания не может быть раньше даты начала')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Необходимо войти в систему')
        return
      }

      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim() || null
        })

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Block dates error:', error)
      alert('Ошибка при блокировке дат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Заблокировать даты</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-400">
            Заблокированные даты будут отображаться в календаре серым цветом, и вы не сможете принимать смены в этот период.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Начало периода <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={getTodayDate()}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Конец периода <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || getTodayDate()}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Причина (необязательно)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: отпуск, болезнь..."
              maxLength={200}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
            <div className="text-xs text-gray-500 mt-1">
              {reason.length}/200 символов
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !startDate || !endDate}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Сохранение...' : 'Заблокировать'}
          </button>
        </div>
      </div>
    </div>
  )
}
