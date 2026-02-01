'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Star, CheckCircle, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptic'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'

export default function ShiftApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [shiftId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load shift
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single()

      setShift(shiftData)

      // Load applications with worker info
      const { data: applicationsData } = await supabase
        .from('shift_applications')
        .select(`
          *,
          worker:users!shift_applications_worker_id_fkey(
            id,
            full_name,
            avatar_url,
            phone,
            email
          )
        `)
        .eq('shift_id', shiftId)
        .order('applied_at', { ascending: false })

      setApplications(applicationsData || [])
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      hapticLight()
      setProcessingId(applicationId)

      const { error } = await supabase
        .from('shift_applications')
        .update({
          status: 'accepted',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      hapticSuccess()
      toast.success('Исполнитель одобрен!')
      loadData()
    } catch (error: any) {
      console.error('Error approving:', error)
      hapticError()
      toast.error(error.message || 'Не удалось одобрить')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      hapticLight()
      setProcessingId(applicationId)

      const { error } = await supabase
        .from('shift_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      hapticSuccess()
      toast.success('Заявка отклонена')
      loadData()
    } catch (error: any) {
      console.error('Error rejecting:', error)
      hapticError()
      toast.error(error.message || 'Не удалось отклонить')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка заявок...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => {
              hapticLight()
              router.back()
            }}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Заявки на смену</h1>
            {shift && (
              <p className="text-sm text-gray-400">{shift.title}</p>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Пока нет заявок
            </h3>
            <p className="text-gray-400">
              Заявки от исполнителей появятся здесь
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <div
              key={application.id}
              className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-fade-in ${
                application.status !== 'pending' ? 'opacity-60' : ''
              }`}
            >
              {/* Worker info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {application.worker.avatar_url ? (
                    <img
                      src={application.worker.avatar_url}
                      alt={application.worker.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    application.worker.full_name?.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {application.worker.full_name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Откликнулся {new Date(application.applied_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="inline-flex">
                    {application.status === 'accepted' && (
                      <span className="status-badge status-accepted px-3 py-1 rounded-full text-xs font-medium">
                        ✓ Одобрен
                      </span>
                    )}
                    {application.status === 'rejected' && (
                      <span className="status-badge status-rejected px-3 py-1 rounded-full text-xs font-medium">
                        ✗ Отклонен
                      </span>
                    )}
                    {application.status === 'pending' && (
                      <span className="status-badge status-pending px-3 py-1 rounded-full text-xs font-medium">
                        ⏳ Ожидает
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
                {application.worker.phone && (
                  <div className="text-sm">
                    <span className="text-gray-400">Телефон: </span>
                    <a href={`tel:${application.worker.phone}`} className="text-white font-medium">
                      {application.worker.phone}
                    </a>
                  </div>
                )}
                {application.worker.email && (
                  <div className="text-sm">
                    <span className="text-gray-400">Email: </span>
                    <span className="text-white font-medium">{application.worker.email}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {application.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(application.id)}
                    disabled={processingId === application.id}
                    className="flex-1 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold hover:bg-red-500/20 transition disabled:opacity-50 btn-press flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Отклонить
                  </button>
                  <button
                    onClick={() => handleApprove(application.id)}
                    disabled={processingId === application.id}
                    className="flex-1 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold hover:bg-green-500/20 transition disabled:opacity-50 btn-press flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Одобрить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
