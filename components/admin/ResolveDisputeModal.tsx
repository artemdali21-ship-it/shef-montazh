'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Ban, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface Props {
  disputeId: string
  shiftId: string | null
  onClose: () => void
}

export default function ResolveDisputeModal({ disputeId, shiftId, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [action, setAction] = useState<'resolve' | 'reject'>('resolve')
  const [resolution, setResolution] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [applyRefund, setApplyRefund] = useState(false)
  const [applyBan, setApplyBan] = useState(false)
  const [banDuration, setBanDuration] = useState<'7' | '30' | '90' | 'permanent'>('30')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!resolution.trim()) {
      alert('Укажите решение по спору')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Необходимо войти в систему')
        return
      }

      // Update dispute status
      const { error: disputeError } = await supabase
        .from('disputes')
        .update({
          status: action === 'resolve' ? 'resolved' : 'rejected',
          resolution: resolution.trim(),
          admin_notes: adminNotes.trim() || null,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', disputeId)

      if (disputeError) throw disputeError

      // Apply refund if requested
      if (applyRefund && shiftId) {
        // TODO: Implement refund logic
        // This would involve updating payment status, creating refund record
        console.log('Refund requested for shift:', shiftId)
      }

      // Apply ban if requested
      if (applyBan) {
        const { data: dispute } = await supabase
          .from('disputes')
          .select('against_user')
          .eq('id', disputeId)
          .single()

        if (dispute) {
          const banUntil = banDuration === 'permanent'
            ? null
            : new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString()

          // Check if worker_profile exists
          const { data: existingProfile } = await supabase
            .from('worker_profiles')
            .select('id')
            .eq('user_id', dispute.against_user)
            .single()

          if (existingProfile) {
            await supabase
              .from('worker_profiles')
              .update({
                status: 'banned',
                ban_reason: `Блокировка по результатам спора #${disputeId.slice(0, 8)}`,
                ban_until: banUntil
              })
              .eq('user_id', dispute.against_user)
          } else {
            await supabase
              .from('worker_profiles')
              .insert({
                user_id: dispute.against_user,
                status: 'banned',
                ban_reason: `Блокировка по результатам спора #${disputeId.slice(0, 8)}`,
                ban_until: banUntil
              })
          }
        }
      }

      // TODO: Send notifications to involved users

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error resolving dispute:', error)
      alert('Ошибка при разрешении спора')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Разрешить спор</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Action Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setAction('resolve')}
            className={`p-4 rounded-xl border transition ${
              action === 'resolve'
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Решить в пользу</span>
          </button>
          <button
            onClick={() => setAction('reject')}
            className={`p-4 rounded-xl border transition ${
              action === 'reject'
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <XCircle className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Отклонить жалобу</span>
          </button>
        </div>

        {/* Resolution */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Решение по спору <span className="text-red-400">*</span>
          </label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            rows={4}
            placeholder="Опишите решение, которое будет видно обеим сторонам..."
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">{resolution.length}/1000</div>
        </div>

        {/* Admin Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Внутренние заметки (необязательно)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            rows={3}
            placeholder="Заметки для других администраторов..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">{adminNotes.length}/500</div>
        </div>

        {/* Additional Actions */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">Дополнительные действия</h3>

          <div className="space-y-3">
            {/* Refund */}
            {shiftId && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyRefund}
                  onChange={(e) => setApplyRefund(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>Вернуть деньги</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Инициировать возврат средств заказчику за эту смену
                  </p>
                </div>
              </label>
            )}

            {/* Ban */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyBan}
                onChange={(e) => setApplyBan(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Ban className="w-4 h-4" />
                  <span>Заблокировать пользователя</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 mb-2">
                  Заблокировать ответчика на указанный срок
                </p>
                {applyBan && (
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value as typeof banDuration)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="7">7 дней</option>
                    <option value="30">30 дней</option>
                    <option value="90">90 дней</option>
                    <option value="permanent">Навсегда</option>
                  </select>
                )}
              </div>
            </label>
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
            disabled={loading || !resolution.trim()}
            className={`flex-1 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'resolve'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {loading ? 'Сохранение...' : action === 'resolve' ? 'Решить' : 'Отклонить'}
          </button>
        </div>
      </div>
    </div>
  )
}
