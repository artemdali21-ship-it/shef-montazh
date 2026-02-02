'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface VerificationStatusProps {
  userId: string
  isEditable?: boolean
}

interface Verification {
  id: string
  type: string
  status: string
  verified_at?: string
}

interface Endorsement {
  id: string
  endorser_user_id: string
  weight: number
  reason?: string
}

export function VerificationStatus({ userId, isEditable = false }: VerificationStatusProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadVerifications()
    loadEndorsements()
  }, [userId])

  const loadVerifications = async () => {
    const { data } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', userId)

    if (data) setVerifications(data)
  }

  const loadEndorsements = async () => {
    const { data } = await supabase
      .from('endorsements')
      .select('*')
      .eq('endorsed_user_id', userId)
      .eq('status', 'active')

    if (data) setEndorsements(data)
  }

  const handleRequestVerification = async (type: 'phone' | 'email' | 'company_inn') => {
    setIsUploading(true)
    try {
      const response = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, provider: 'manual' })
      })
      if (response.ok) {
        alert('Верификация запрошена')
        loadVerifications()
      }
    } catch (error) {
      alert('Ошибка')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <div>
        <h3 className="font-semibold text-white mb-2">Статус верификации</h3>

        {/* Телефон */}
        <div className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded-lg">
          <span className="text-white text-sm">Телефон</span>
          <span className={verifications?.find(v => v.type === 'phone')?.status === 'verified' ? 'text-green-400' : 'text-gray-400'}>
            {verifications?.find(v => v.type === 'phone')?.status === 'verified' ? '✓ Проверен' : '○ Ожидание'}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded-lg">
          <span className="text-white text-sm">Email</span>
          <span className={verifications?.find(v => v.type === 'email')?.status === 'verified' ? 'text-green-400' : 'text-gray-400'}>
            {verifications?.find(v => v.type === 'email')?.status === 'verified' ? '✓ Проверен' : '○ Ожидание'}
          </span>
        </div>

        {/* Компания */}
        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
          <span className="text-white text-sm">Компания (ИНН)</span>
          <span className={verifications?.find(v => v.type === 'company_inn')?.status === 'verified' ? 'text-green-400' : 'text-gray-400'}>
            {verifications?.find(v => v.type === 'company_inn')?.status === 'verified' ? '✓ Проверена' : '○ Ожидание'}
          </span>
        </div>
      </div>

      {/* Рекомендации */}
      <div>
        <h3 className="font-semibold text-white mb-2">Рекомендации</h3>
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          <span className="text-white">🌟 {endorsements?.length || 0} рекомендаций</span>
          {endorsements && endorsements.length > 0 && (
            <span className="text-green-400 text-sm">Рекомендован шефом</span>
          )}
        </div>
      </div>

      {isEditable && (
        <button
          onClick={() => handleRequestVerification('phone')}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-medium transition"
        >
          {isUploading ? 'Загрузка...' : 'Запросить верификацию'}
        </button>
      )}
    </div>
  )
}
