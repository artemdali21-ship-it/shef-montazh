'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, User, Star, Briefcase, Clock, MapPin, Phone,
  CheckCircle, XCircle, Eye, Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import type { Tables } from '@/lib/supabase-types'

type Application = Tables<'shift_applications'>
type WorkerProfile = Tables<'worker_profiles'>

interface ApplicationWithWorker extends Application {
  worker?: {
    id: string
    first_name: string
    last_name: string
    phone?: string
  }
  worker_profile?: WorkerProfile
}

export default function ShiftApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [applications, setApplications] = useState<ApplicationWithWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [shiftId])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Load shift details
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single()

      if (shiftError) throw shiftError
      setShift(shiftData)

      // Load applications with worker profiles
      const { data: appsData, error: appsError } = await supabase
        .from('shift_applications')
        .select(`
          *,
          users!shift_applications_worker_id_fkey (
            id,
            first_name,
            last_name,
            phone
          ),
          worker_profiles!shift_applications_worker_id_fkey (
            *
          )
        `)
        .eq('shift_id', shiftId)
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      // Transform data
      const transformedApps = (appsData || []).map((app: any) => ({
        ...app,
        worker: app.users,
        worker_profile: app.worker_profiles
      }))

      setApplications(transformedApps)

    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingId(applicationId)

      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve')
      }

      // Reload data
      await loadData()

      // Show success toast (if you have toast system)
      alert('Заявка одобрена!')

    } catch (error: any) {
      console.error('Error approving application:', error)
      alert(error.message || 'Ошибка при одобрении заявки')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      setProcessingId(applicationId)

      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject')
      }

      // Reload data
      await loadData()

      alert('Заявка отклонена')

    } catch (error: any) {
      console.error('Error rejecting application:', error)
      alert(error.message || 'Ошибка при отклонении заявки')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <LoadingScreen message="Загрузка откликов..." />
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          <h1 className="text-h1 text-white mb-1">Отклики на смену</h1>
          <p className="text-body-small text-gray-400">{shift?.title}</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Shift Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Информация о смене</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              shift?.status === 'open' ? 'bg-green-500/20 text-green-400' :
              shift?.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {shift?.status === 'open' ? 'Открыта' :
               shift?.status === 'in_progress' ? 'В работе' :
               shift?.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{shift?.date} • {shift?.start_time} - {shift?.end_time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{shift?.location_address}</span>
            </div>
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <span>{shift?.pay_amount?.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-yellow-500/10 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-3 text-center">
            <p className="text-2xl font-bold text-white">{pendingApplications.length}</p>
            <p className="text-xs text-gray-400">Ожидают</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-3 text-center">
            <p className="text-2xl font-bold text-white">{approvedApplications.length}</p>
            <p className="text-xs text-gray-400">Одобрено</p>
          </div>
          <div className="bg-gray-500/10 backdrop-blur-xl rounded-xl border border-gray-500/20 p-3 text-center">
            <p className="text-2xl font-bold text-white">{rejectedApplications.length}</p>
            <p className="text-xs text-gray-400">Отклонено</p>
          </div>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Новые отклики</h2>
            <div className="space-y-3">
              {pendingApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processingId === app.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Approved Applications */}
        {approvedApplications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Одобренные</h2>
            <div className="space-y-3">
              {approvedApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processingId === app.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Applications */}
        {rejectedApplications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Отклоненные</h2>
            <div className="space-y-3">
              {rejectedApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processingId === app.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Нет откликов</h3>
            <p className="text-gray-400">Пока никто не откликнулся на эту смену</p>
          </div>
        )}
      </div>
    </main>
  )
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
  processing
}: {
  application: ApplicationWithWorker
  onApprove: (id: string) => void
  onReject: (id: string) => void
  processing: boolean
}) {
  const router = useRouter()
  const worker = application.worker
  const profile = application.worker_profile

  return (
    <div
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition"
    >
      {/* Worker Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">
            {worker?.first_name} {worker?.last_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {profile && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-300">
                    {profile.rating?.toFixed(1) || '—'}
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {profile.completed_shifts || 0} смен
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {application.status === 'approved' && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            Одобрен
          </span>
        )}
        {application.status === 'rejected' && (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            Отклонен
          </span>
        )}
      </div>

      {/* Skills */}
      {profile?.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.slice(0, 3).map((skill: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {application.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(application.id)}
              disabled={processing}
              className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Одобрить
                </>
              )}
            </button>
            <button
              onClick={() => onReject(application.id)}
              disabled={processing}
              className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Отклонить
                </>
              )}
            </button>
          </>
        )}
        <button
          onClick={() => router.push(`/worker/profile/${worker?.id}`)}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Профиль
        </button>
      </div>
    </div>
  )
}
