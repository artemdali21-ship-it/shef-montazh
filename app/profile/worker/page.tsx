'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, Star, Briefcase, TrendingUp, DollarSign, Calendar,
  MapPin, Edit, Shield, CheckCircle, Award, LogOut
} from 'lucide-react'
import { getWorkerProfile, getWorkerShiftHistory } from '@/lib/api/profiles'
import { getWorkerPaymentsSummary } from '@/lib/api/payments'
import { ShiftStatus } from '@/components/shift/ShiftStatus'
import { supabase } from '@/lib/supabase'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Tables } from '@/lib/supabase-types'

type WorkerProfileData = {
  id: string
  full_name: string
  avatar_url?: string
  rating: number
  total_shifts: number
  successful_shifts: number
  gosuslugi_verified: boolean
  is_verified: boolean
  profile: {
    bio?: string
    categories?: string[]
    experience_years?: number
    tools_available?: string[]
    status?: string
  }
}

type ShiftHistoryItem = {
  id: string
  status: string
  created_at: string
  shift: {
    id: string
    title: string
    category: string
    date: string
    pay_amount: number
    location_address: string
    start_time: string
    end_time: string
  }
}

export default function WorkerProfilePage() {
  const router = useRouter()

  const [worker, setWorker] = useState<WorkerProfileData | null>(null)
  const [shiftHistory, setShiftHistory] = useState<ShiftHistoryItem[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorkerData() {
      try {
        setLoading(true)
        setError(null)

        // Get current user from auth
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Load worker profile
        const { data: workerData, error: workerError } = await getWorkerProfile(user.id)
        if (workerError) throw workerError
        if (!workerData) throw new Error('Профиль не найден')

        setWorker(workerData as WorkerProfileData)

        // Load shift history (limit to 10)
        const { data: historyData, error: historyError } = await getWorkerShiftHistory(user.id)
        if (!historyError && historyData) {
          setShiftHistory((historyData as ShiftHistoryItem[]).slice(0, 10))
        }

        // Load total earnings
        const summary = await getWorkerPaymentsSummary(user.id)
        setTotalEarnings(summary.totalReceived || 0)
      } catch (err) {
        console.error('Error loading worker profile:', err)
        setError('Не удалось загрузить профиль')
      } finally {
        setLoading(false)
      }
    }

    loadWorkerData()
  }, [router])

  const handleLogout = async () => {
    try {
      toast.loading('Выход из системы...')
      await supabase.auth.signOut()
      toast.dismiss()
      toast.success('Вы вышли из системы')
      router.push('/auth/login')
    } catch (err) {
      toast.dismiss()
      toast.error('Ошибка при выходе')
      console.error('Logout error:', err)
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
    return timeStr.slice(0, 5)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : index < rating
            ? 'text-yellow-400 fill-yellow-400 opacity-50'
            : 'text-gray-600'
        }`}
      />
    ))
  }

  const calculateSuccessRate = () => {
    if (!worker || worker.total_shifts === 0) return 0
    return Math.round((worker.successful_shifts / worker.total_shifts) * 100)
  }

  if (loading) {
    return <LoadingScreen message="Загрузка профиля..." />
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full" role="alert">
          <p className="text-red-400 text-center mb-4">{error || 'Профиль не найден'}</p>
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

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-h2 text-white">Мой профиль</h1>
          <button
            onClick={() => router.push('/profile/edit')}
            aria-label="Редактировать профиль"
            className="flex items-center gap-2 px-4 min-h-[44px] bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 transition-colors duration-200"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Редактировать</span>
          </button>
        </div>
      </motion.header>

      {/* Profile Header Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 opacity-30"></div>
        <div className="relative p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 mb-4">
                {worker.avatar_url ? (
                  <img
                    src={worker.avatar_url}
                    alt={worker.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              {/* Verification Badges */}
              {worker.gosuslugi_verified && (
                <div className="absolute bottom-4 right-0 w-9 h-9 bg-blue-500 rounded-full border-4 border-[#2A2A2A] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
              {worker.is_verified && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#BFFF00] rounded-full border-4 border-[#2A2A2A] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#1A1A1A]" />
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-white mb-2">{worker.full_name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-1">
              {renderStars(worker.rating)}
            </div>
            <p className="text-lg font-semibold text-orange-400 mb-4">
              {worker.rating.toFixed(1)} из 5
            </p>

            {/* Total Shifts Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <Briefcase className="w-4 h-4 text-gray-300" />
              <span className="text-white font-medium">{worker.total_shifts} смен выполнено</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Shifts */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{worker.total_shifts}</p>
              <p className="text-xs text-gray-400">Всего смен</p>
            </div>
          </div>

          {/* Successful */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{worker.successful_shifts}</p>
              <p className="text-xs text-gray-400">Успешных</p>
              <p className="text-xs text-[#BFFF00] font-semibold mt-1">{calculateSuccessRate()}%</p>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {(totalEarnings / 1000).toFixed(0)}к
              </p>
              <p className="text-xs text-gray-400">Заработано</p>
            </div>
          </div>
        </div>

        {/* Experience Badge */}
        {worker.profile?.experience_years !== undefined && worker.profile.experience_years > 0 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Опыт работы</p>
                <p className="text-lg font-bold text-white">
                  {worker.profile.experience_years} {worker.profile.experience_years === 1 ? 'год' : worker.profile.experience_years < 5 ? 'года' : 'лет'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills/Categories */}
        {worker.profile?.categories && worker.profile.categories.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-400" />
              Категории
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.profile.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-[#BFFF00]/20 border border-orange-500/30 rounded-lg text-sm font-medium"
                  style={{
                    color: index % 2 === 0 ? '#E85D2F' : '#BFFF00'
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Shifts */}
        {shiftHistory.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Последние смены
              </h3>
              <span className="text-sm text-gray-400">({shiftHistory.length})</span>
            </div>
            <div className="space-y-3">
              {shiftHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                  onClick={() => router.push(`/shift/${item.shift.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">
                        {item.shift.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                          {item.shift.category}
                        </span>
                        <ShiftStatus
                          status={item.status as 'open' | 'accepted' | 'on_way' | 'checked_in' | 'completed'}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-green-400 font-bold text-lg">
                        {item.shift.pay_amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.shift.date)}</span>
                    <span>•</span>
                    <span>{formatTime(item.shift.start_time)} - {formatTime(item.shift.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{item.shift.location_address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {shiftHistory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">Пока нет завершённых смен</p>
            <p className="text-sm text-gray-500">Начните работать и смены появятся здесь</p>
          </div>
        )}

        {/* Logout Button */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <button
            onClick={handleLogout}
            aria-label="Выйти из аккаунта"
            className="w-full min-h-[44px] py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-bold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </motion.main>
  )
}
