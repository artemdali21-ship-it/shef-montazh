'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface PendingVerification {
  id: string
  user_id: string
  type: string
  provider: string
  created_at: string
  users?: {
    full_name?: string
    telegram_id?: string
  }
}

export default function VerificationsAdminPage() {
  const supabase = createClient()
  const [pending, setPending] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('verifications')
      .select('id, user_id, type, provider, created_at, users(full_name, telegram_id)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (data) setPending(data as any)
    setLoading(false)
  }

  const handleApprove = async (verificationId: string, userId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/verifications/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, approved })
      })

      if (response.ok) {
        await loadPending()
      }
    } catch (error) {
      console.error('Error approving verification:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Загрузка...</h1>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Верификации на одобрение</h1>

      {pending.length === 0 ? (
        <p className="text-gray-400">Нет ожидающих верификаций</p>
      ) : (
        <div className="space-y-2">
          {pending.map((v) => (
            <div
              key={v.id}
              className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg flex justify-between items-center hover:bg-white/10 transition"
            >
              <div>
                <p className="font-semibold text-white">{v.users?.full_name || 'Unknown'}</p>
                <p className="text-sm text-gray-400">{v.type} — {v.provider}</p>
                <p className="text-xs text-gray-500">{new Date(v.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(v.id, v.user_id, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  ✓ Одобрить
                </button>
                <button
                  onClick={() => handleApprove(v.id, v.user_id, false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  ✗ Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
