'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Star, CheckCircle, X, MessageSquare, Shield,
  Briefcase, Users, AlertCircle
} from 'lucide-react'
import { getShiftById } from '@/lib/api/shifts'
import {
  getShiftApplications,
  acceptApplication,
  rejectApplication
} from '@/lib/api/applications'
import type { Tables } from '@/lib/supabase-types'

type Shift = Tables<'shifts'>
type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

interface WorkerProfile {
  user_id: string
  categories: string[] | null
  bio: string | null
}

interface Worker {
  id: string
  full_name: string
  avatar_url: string | null
  rating: number
  total_shifts: number
  gosuslugi_verified: boolean
  profile: WorkerProfile | null
}

interface Application {
  id: string
  shift_id: string
  worker_id: string
  message: string | null
  status: ApplicationStatus
  created_at: string
  worker: Worker
}

const CATEGORY_NAMES: Record<string, string> = {
  montazhnik: 'Монтажник',
  decorator: 'Декоратор',
  electrik: 'Электрик',
  svarchik: 'Сварщик',
  alpinist: 'Альпинист',
  butafor: 'Бутафор',
  raznorabochiy: 'Разнорабочий',
}

export default function ShiftApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string

  // Mock current user - in production, get from auth context
  const MOCK_CLIENT_ID = 'client-456'
  const currentUserId = MOCK_CLIENT_ID

  const [shift, setShift] = useState<Shift | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | ApplicationStatus>('all')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [shiftId])

  useEffect(() => {
    filterApplications()
  }, [applications, activeFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load shift
      const { data: shiftData, error: shiftError } = await getShiftById(shiftId)
      if (shiftError) throw shiftError
      if (!shiftData) throw new Error('Смена не найдена')

      // Check if user is shift owner
      if (shiftData.client_id !== currentUserId) {
        setError('У вас нет доступа к этой странице')
        return
      }

      setShift(shiftData)

      // Load applications
      const { data: applicationsData, error: applicationsError } = await getShiftApplications(shiftId)
      if (applicationsError) throw applicationsError

      setApplications((applicationsData as Application[]) || [])
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    if (activeFilter === 'all') {
      setFilteredApplications(applications)
    } else {
      setFilteredApplications(applications.filter(app => app.status === activeFilter))
    }
  }

  const handleAccept = async (applicationId: string) => {
    if (processingIds.has(applicationId)) return

    setProcessingIds(prev => new Set(prev).add(applicationId))

    try {
      const { error } = await acceptApplication(applicationId)

      if (error) {
        alert('Не удалось одобрить отклик')
        return
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'accepted' as ApplicationStatus } : app
        )
      )

      showToast('✓ Отклик одобрен! Работник добавлен в смену')
    } catch (err) {
      console.error('Error accepting application:', err)
      alert('Произошла ошибка')
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(applicationId)
        return next
      })
    }
  }

  const handleReject = async (applicationId: string) => {
    if (processingIds.has(applicationId)) return

    setProcessingIds(prev => new Set(prev).add(applicationId))

    try {
      const { error } = await rejectApplication(applicationId)

      if (error) {
        alert('Не удалось отклонить отклик')
        return
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'rejected' as ApplicationStatus } : app
        )
      )

      showToast('Отклик отклонен')
    } catch (err) {
      console.error('Error rejecting application:', err)
      alert('Произошла ошибка')
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(applicationId)
        return next
      })
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            Ожидает
          </span>
        )
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Одобрен
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
            <X className="w-3 h-3" />
            Отклонен
          </span>
        )
    }
  }

  const getFilterCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка откликов...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition font-semibold"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  const counts = getFilterCounts()

  return (
    <div className="min-h-screen bg-dashboard pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Отклики на смену</h1>
            {shift && (
              <p className="text-sm text-gray-400 truncate">{shift.title}</p>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Все ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Ожидают ({counts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeFilter === 'accepted'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Одобрены ({counts.accepted})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Отклонены ({counts.rejected})
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-4 space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {activeFilter === 'all'
                ? 'Пока нет откликов'
                : activeFilter === 'pending'
                ? 'Нет ожидающих откликов'
                : activeFilter === 'accepted'
                ? 'Нет одобренных откликов'
                : 'Нет отклоненных откликов'}
            </h3>
            <p className="text-gray-400">
              {activeFilter === 'all' && 'Работники смогут откликнуться на вашу смену'}
            </p>
          </div>
        ) : (
          filteredApplications.map(application => {
            const worker = application.worker
            const isProcessing = processingIds.has(application.id)
            const isPending = application.status === 'pending'

            return (
              <div
                key={application.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
              >
                {/* Worker Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt={worker.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">{worker.full_name}</h3>
                      {worker.gosuslugi_verified && (
                        <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-300">{(worker.rating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{worker.total_shifts || 0} смен</span>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </div>

                {/* Categories */}
                {worker.profile?.categories && worker.profile.categories.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-400">Специализация</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {worker.profile.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium"
                        >
                          {CATEGORY_NAMES[category] || category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {application.message && (
                  <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-400">Сообщение от работника</p>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{application.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {isPending && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(application.id)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <X className="w-5 h-5" />
                          Отклонить
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAccept(application.id)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Одобрить
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-green-500/90 backdrop-blur-xl rounded-xl px-6 py-3 shadow-lg">
            <p className="text-white font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
