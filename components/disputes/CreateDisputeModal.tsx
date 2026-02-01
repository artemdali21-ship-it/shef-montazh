'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

const REASONS = [
  { value: 'no_show', label: 'Не вышел на смену', icon: '🚫' },
  { value: 'late', label: 'Опоздание', icon: '⏰' },
  { value: 'damage', label: 'Порча оборудования', icon: '💥' },
  { value: 'quality', label: 'Некачественная работа', icon: '⚠️' },
  { value: 'payment', label: 'Проблема с оплатой', icon: '💰' },
  { value: 'other', label: 'Другое', icon: '📝' }
]

interface Props {
  shiftId: string
  againstUserId: string
  againstUserName: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateDisputeModal({
  shiftId,
  againstUserId,
  againstUserName,
  onClose,
  onSuccess
}: Props) {
  const supabase = createClient()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      alert('Заполните все поля')
      return
    }

    if (description.trim().length < 20) {
      alert('Описание должно содержать минимум 20 символов')
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
        .from('disputes')
        .insert({
          shift_id: shiftId,
          created_by: user.id,
          against_user: againstUserId,
          reason,
          description: description.trim()
        })

      if (error) throw error

      // TODO: Send notification to admin and against_user

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Dispute creation error:', error)
      alert('Ошибка при создании спора')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Сообщить о проблеме</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-orange-400">
            ⚠️ Спор будет рассмотрен администрацией. Убедитесь, что описание проблемы точное и подробное.
          </p>
        </div>

        {/* Against User */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Жалоба на пользователя</p>
          <p className="text-white font-medium">{againstUserName}</p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Причина <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Выберите причину</option>
              {REASONS.map(r => (
                <option key={r.value} value={r.value}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Описание проблемы <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
              rows={5}
              placeholder="Опишите ситуацию подробно: что произошло, когда, какие есть доказательства..."
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                Минимум 20 символов
              </span>
              <span className="text-xs text-gray-500">
                {description.length}/1000
              </span>
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
            disabled={loading || !reason || description.trim().length < 20}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Отправка...' : 'Отправить жалобу'}
          </button>
        </div>
      </div>
    </div>
  )
}
