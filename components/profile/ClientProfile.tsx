'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Clock,
  CheckCircle,
  Settings,
  Plus,
  ArrowRight,
  MessageCircle,
  Star,
} from 'lucide-react'
import { StarRating } from '../rating/StarRating'
import { getClientProfile, getClientActiveShifts, getClientCompletedShifts } from '@/lib/api/profiles'

interface ClientProfileProps {
  userId?: string
  companyName?: string
  companyId?: string
  isPremium?: boolean
}

export default function ClientProfile({
  userId = 'mock-client-id',
  companyName,
  companyId,
  isPremium = true,
}: ClientProfileProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [profile, setProfile] = useState<any>(null)
  const [activeShifts, setActiveShifts] = useState<any[]>([])
  const [completedShifts, setCompletedShifts] = useState<any[]>([])

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true)
        setError(null)
        
        // Load profile
        const { data: profileData, error: profileError } = await getClientProfile(userId)
        if (profileError) throw profileError
        
        // Load active shifts
        const { data: activeData, error: activeError } = await getClientActiveShifts(userId)
        if (activeError) throw activeError
        
        // Load completed shifts
        const { data: completedData, error: completedError } = await getClientCompletedShifts(userId)
        if (completedError) throw completedError
        
        setProfile(profileData)
        setActiveShifts(activeData || [])
        setCompletedShifts(completedData || [])
        
      } catch (err) {
        console.error('Error loading client profile:', err)
        setError('Не удалось загрузить профиль')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="text-white text-lg">Загрузка профиля...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const displayCompanyName = companyName || profile?.profile?.company_name || 'Компания'
  const totalPosted = profile?.profile?.shifts_published || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] pb-20">
      {/* HEADER SECTION */}
      <div
        className="relative pt-6 px-4 pb-8 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Settings Icon */}
        <button 
          onClick={() => router.push('/settings')}
          className="absolute top-6 right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <Settings size={24} className="text-white" />
        </button>

        {/* Company Logo */}
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #E85D2F 0%, #FF8855 100%)',
            border: isPremium ? '3px solid #BFFF00' : '3px solid rgba(255,255,255,0.2)',
          }}
        >
          <Briefcase size={48} className="text-white" />
        </div>

        {/* Company Name */}
        <h1 className="text-2xl font-bold text-white mb-2">{displayCompanyName}</h1>

        {/* ID */}
        <p className="text-sm text-gray-400">
          ID: {profile?.id?.substring(0, 8).toUpperCase() || '---'}
        </p>
      </div>

      {/* STATS ROW */}
      <div className="px-4 py-6 grid grid-cols-3 gap-3">
        {/* Total Posted */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Briefcase size={24} className="text-[#E85D2F] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{totalPosted}</div>
          <div className="text-xs text-gray-400">Опубликовано</div>
        </div>

        {/* Active Shifts */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Clock size={24} className="text-[#BFFF00] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{activeShifts.length}</div>
          <div className="text-xs text-gray-400">Активных</div>
        </div>

        {/* Completed */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CheckCircle size={24} className="text-[#4ADE80] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{completedShifts.length}</div>
          <div className="text-xs text-gray-400">Завершено</div>
        </div>
      </div>

      {/* CREATE SHIFT BUTTON */}
      <div className="px-4 mb-6">
        <button
          onClick={() => router.push('/create-shift')}
          className="w-full bg-gradient-to-r from-[#E85D2F] to-[#FF8855] hover:from-[#D04D1F] hover:to-[#E87744] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30"
        >
          <Plus size={24} />
          Создать новую смену
        </button>
      </div>

      {/* ACTIVE SHIFTS */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Активные смены</h2>
          {activeShifts.length > 3 && (
            <button
              onClick={() => router.push('/shifts')}
              className="text-[#E85D2F] text-sm font-medium hover:underline"
            >
              Все →
            </button>
          )}
        </div>

        {activeShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Clock size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Нет активных смен</p>
            <p className="text-gray-500 text-sm mt-2">
              Создайте новую смену, чтобы найти исполнителей
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeShifts.slice(0, 3).map((shift) => (
              <div
                key={shift.id}
                onClick={() => router.push(`/shift/${shift.id}`)}
                className="rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{shift.title}</h3>
                    <p className="text-gray-400 text-sm">{shift.location_address}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shift.status === 'open'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {shift.status === 'open' ? 'Открыта' : 'В работе'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {shift.applications_count || 0} откликов
                    </span>
                  </div>
                  <span className="text-white font-bold">
                    {shift.pay_amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED SHIFTS */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Завершенные смены</h2>
          {completedShifts.length > 2 && (
            <button
              onClick={() => router.push('/shifts?status=completed')}
              className="text-[#E85D2F] text-sm font-medium hover:underline"
            >
              Все →
            </button>
          )}
        </div>

        {completedShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <CheckCircle size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Нет завершенных смен</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedShifts.slice(0, 2).map((shift) => (
              <div
                key={shift.id}
                onClick={() => router.push(`/shift/${shift.id}`)}
                className="rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{shift.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(shift.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium">5.0</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">{shift.location_address}</span>
                  <span className="text-white font-bold">
                    {shift.pay_amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
