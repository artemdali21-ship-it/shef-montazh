'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Star, Shield, Briefcase, User, CheckCircle,
  Calendar, MapPin, DollarSign, Clock, Award, Wrench
} from 'lucide-react'
import { getWorkerProfile, getWorkerShiftHistory, getWorkerRatings } from '@/lib/api/profiles'
import { getUserReceivedRatings } from '@/lib/api/ratings'

interface WorkerData {
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

interface ShiftHistory {
  id: string
  shift: {
    id: string
    title: string
    category: string
    date: string
    pay_amount: number
    location_address: string
  }
}

interface Rating {
  id: string
  rating: number
  comment?: string
  created_at: string
  from_user: {
    full_name: string
    avatar_url?: string
  }
  shift: {
    title: string
    date: string
  }
}

export default function WorkerProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [worker, setWorker] = useState<WorkerData | null>(null)
  const [shiftHistory, setShiftHistory] = useState<ShiftHistory[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorkerData() {
      try {
        setLoading(true)
        setError(null)

        // Load worker profile
        const { data: workerData, error: workerError } = await getWorkerProfile(userId)
        if (workerError) throw workerError
        if (!workerData) throw new Error('Профиль работника не найден')

        setWorker(workerData as WorkerData)

        // Load shift history
        const { data: historyData } = await getWorkerShiftHistory(userId)
        if (historyData) {
          setShiftHistory(historyData as ShiftHistory[])
        }

        // Load ratings
        const { data: ratingsData } = await getUserReceivedRatings(userId)
        if (ratingsData) {
          setRatings(ratingsData as Rating[])
        }
      } catch (err) {
        console.error('Error loading worker profile:', err)
        setError('Не удалось загрузить профиль работника')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadWorkerData()
    }
  }, [userId])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateReliability = () => {
    if (!worker || worker.total_shifts === 0) return 0
    return Math.round((worker.successful_shifts / worker.total_shifts) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
          <p className="text-red-400 text-center mb-4">{error || 'Профиль не найден'}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Профиль работника</h1>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 opacity-30"></div>
        <div className="relative p-6 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20">
              {worker.avatar_url ? (
                <img
                  src={worker.avatar_url}
                  alt={worker.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                worker.full_name.charAt(0).toUpperCase()
              )}
            </div>
            {/* Verification Badge */}
            {worker.gosuslugi_verified && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full border-4 border-[#2A2A2A] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
            {worker.is_verified && (
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-[#2A2A2A] flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-white mb-1">{worker.full_name}</h2>
          <p className="text-gray-400 text-sm mb-6">ID: {worker.id.slice(0, 8).toUpperCase()}</p>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Briefcase className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{worker.total_shifts}</span>
              </div>
              <p className="text-xs text-gray-400">Смен</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-white">{worker.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-400">Рейтинг</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{calculateReliability()}%</span>
              </div>
              <p className="text-xs text-gray-400">Надёжность</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Bio Section */}
        {worker.profile?.bio && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-400" />
              О себе
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{worker.profile.bio}</p>
          </div>
        )}

        {/* Experience */}
        {worker.profile?.experience_years !== undefined && worker.profile.experience_years > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Опыт работы</p>
                <p className="text-xl font-bold text-white">
                  {worker.profile.experience_years} {worker.profile.experience_years === 1 ? 'год' : worker.profile.experience_years < 5 ? 'года' : 'лет'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
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
                  className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-orange-400 font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools/Skills */}
        {worker.profile?.tools_available && worker.profile.tools_available.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-400" />
              Инструменты и навыки
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.profile.tools_available.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shift History */}
        {shiftHistory.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              История смен
              <span className="ml-auto text-sm text-gray-400">({shiftHistory.length})</span>
            </h3>
            <div className="space-y-3">
              {shiftHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">
                        {item.shift.title}
                      </h4>
                      <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                        {item.shift.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        {item.shift.pay_amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.shift.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{item.shift.location_address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {ratings.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Отзывы
              <span className="ml-auto text-sm text-gray-400">({ratings.length})</span>
            </h3>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {review.from_user.avatar_url ? (
                        <img
                          src={review.from_user.avatar_url}
                          alt={review.from_user.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        review.from_user.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">
                          {review.from_user.full_name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {review.shift.title} • {formatDate(review.created_at)}
                      </p>
                      {review.comment && (
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {shiftHistory.length === 0 && ratings.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Пока нет завершённых смен и отзывов</p>
          </div>
        )}
      </div>
    </div>
  )
}
