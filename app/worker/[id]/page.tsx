'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Star, Shield, Briefcase, Calendar, MapPin, Loader2, MessageCircle, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import FavoriteButton from '@/components/user/FavoriteButton'
import BlockButton from '@/components/user/BlockButton'
import { isFavorite } from '@/lib/api/favorites'
import { isBlocked } from '@/lib/api/blocked'
import Image from 'next/image'

export default function WorkerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const workerId = params.id as string

  const [worker, setWorker] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    loadWorkerProfile()
  }, [workerId])

  const loadWorkerProfile = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)

        // Check if favorited or blocked
        const [favStatus, blockStatus] = await Promise.all([
          isFavorite(user.id, workerId),
          isBlocked(user.id, workerId)
        ])
        setFavorite(favStatus)
        setBlocked(blockStatus)
      }

      // Fetch worker data
      const { data: workerData, error: workerError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          avatar_url,
          phone,
          rating,
          role,
          is_verified,
          gosuslugi_verified,
          successful_shifts,
          total_shifts,
          created_at,
          worker_profiles (
            bio,
            categories,
            experience_years,
            district
          )
        `)
        .eq('id', workerId)
        .eq('role', 'worker')
        .single()

      if (workerError) throw workerError

      setWorker(workerData)
    } catch (error) {
      console.error('Error loading worker profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = () => {
    // TODO: Open modal to select shift and invite worker
    alert('Функция приглашения будет реализована в следующей версии')
  }

  const handleMessage = () => {
    // TODO: Open chat with worker
    alert('Чат будет реализован в следующей версии')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Исполнитель не найден</h2>
          <p className="text-gray-400 mb-6">Возможно, профиль был удалён</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  const profile = worker.worker_profiles?.[0]
  const completionRate = worker.total_shifts > 0
    ? Math.round((worker.successful_shifts / worker.total_shifts) * 100)
    : 0

  // Calculate price based on experience
  const experience = profile?.experience_years || 0
  const basePrice = 5000
  const experienceBonus = experience * 500
  const pricePerShift = basePrice + experienceBonus

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-h1 text-white">Профиль исполнителя</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          {/* Avatar & Name */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              {worker.avatar_url ? (
                <Image
                  src={worker.avatar_url}
                  alt={worker.full_name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {worker.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {worker.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{worker.full_name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-2">
                {worker.rating > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">
                      {worker.rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Нет оценок</span>
                )}
                {worker.gosuslugi_verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-semibold">Госуслуги</span>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  На платформе с {new Date(worker.created_at).toLocaleDateString('ru-RU', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">О себе</h3>
              <p className="text-white leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Categories */}
          {profile?.categories && profile.categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Специализации</h3>
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((cat: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* District */}
          {profile?.district && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{profile.district}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Shifts */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Смен</span>
              </div>
              <p className="text-white font-bold text-xl">
                {worker.successful_shifts}/{worker.total_shifts}
              </p>
            </div>

            {/* Success Rate */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Успех</span>
              </div>
              <p className="text-white font-bold text-xl">{completionRate}%</p>
            </div>

            {/* Experience */}
            {experience > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Опыт</span>
                </div>
                <p className="text-white font-bold text-xl">
                  {experience} {experience === 1 ? 'год' : 'лет'}
                </p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400/60 mb-1">Стоимость за смену</p>
                <p className="text-green-400 font-bold text-2xl">
                  {pricePerShift.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="text-right text-xs text-green-400/60">
                {experience > 0 && (
                  <p>Базовая: {basePrice.toLocaleString('ru-RU')} ₽</p>
                )}
                {experience > 0 && (
                  <p>Опыт: +{experienceBonus.toLocaleString('ru-RU')} ₽</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {currentUserId && !blocked && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleInvite}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Пригласить
              </button>
              <button
                onClick={handleMessage}
                className="py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Написать
              </button>
            </div>
          )}

          {/* Favorite & Block Buttons */}
          {currentUserId && (
            <div className="grid grid-cols-2 gap-3">
              <FavoriteButton
                userId={currentUserId}
                targetUserId={workerId}
                isFavorite={favorite}
                onToggle={(isFav) => setFavorite(isFav)}
                variant="full"
                size="md"
              />
              <BlockButton
                userId={currentUserId}
                targetUserId={workerId}
                targetUserName={worker.full_name}
                isBlocked={blocked}
                onBlock={() => {
                  setBlocked(!blocked)
                  if (!blocked) {
                    // If blocking, remove from favorites
                    setFavorite(false)
                  }
                }}
                variant="full"
                size="md"
              />
            </div>
          )}

          {/* Blocked Message */}
          {blocked && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">
                Вы заблокировали этого пользователя. Разблокируйте для взаимодействия.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
