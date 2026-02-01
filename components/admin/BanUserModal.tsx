'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface Props {
  user: { id: string; full_name: string; email: string }
  onClose: () => void
  onSuccess: () => void
}

export default function BanUserModal({ user, onClose, onSuccess }: Props) {
  const supabase = createClient()
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState<'7' | '30' | '90' | 'permanent'>('30')
  const [loading, setLoading] = useState(false)

  const handleBan = async () => {
    if (!reason.trim()) {
      alert('Укажите причину блокировки')
      return
    }

    setLoading(true)

    try {
      const banUntil = duration === 'permanent'
        ? null
        : new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString()

      // Check if worker_profile exists
      const { data: existingProfile } = await supabase
        .from('worker_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('worker_profiles')
          .update({
            status: 'banned',
            ban_reason: reason.trim(),
            ban_until: banUntil
          })
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new worker profile with banned status
        const { error } = await supabase
          .from('worker_profiles')
          .insert({
            user_id: user.id,
            status: 'banned',
            ban_reason: reason.trim(),
            ban_until: banUntil
          })

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Ban error:', error)
      alert('Ошибка при блокировке пользователя')
    } finally {
      setLoading(false)
    }
  }

  const getDurationLabel = () => {
    switch (duration) {
      case '7':
        return '7 дней'
      case '30':
        return '30 дней'
      case '90':
        return '90 дней'
      case 'permanent':
        return 'Навсегда'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Заблокировать пользователя</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Пользователь</p>
          <p className="text-white font-medium">{user.full_name}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Причина блокировки <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            rows={3}
            placeholder="Опишите причину блокировки..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {reason.length}/500 символов
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Срок блокировки
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as typeof duration)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
          >
            <option value="7">7 дней</option>
            <option value="30">30 дней</option>
            <option value="90">90 дней</option>
            <option value="permanent">Навсегда</option>
          </select>
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-orange-400">
            ⚠️ Пользователь будет заблокирован на {getDurationLabel().toLowerCase()} и не сможет пользоваться платформой.
          </p>
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
            onClick={handleBan}
            disabled={loading || !reason.trim()}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? 'Блокировка...' : 'Заблокировать'}
          </button>
        </div>
      </div>
    </div>
  )
}
