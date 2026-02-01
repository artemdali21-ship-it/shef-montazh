'use client'

import { useState } from 'react'
import { Star, User, Shield, Check, X } from 'lucide-react'
import { acceptApplication, rejectApplication } from '@/lib/api/applications'
import { useToast } from '@/components/ui/ToastProvider'

interface ApplicationsListProps {
  applications: any[]
  onUpdate: () => void
}

export default function ApplicationsList({ applications, onUpdate }: ApplicationsListProps) {
  const toast = useToast()
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAccept = async (applicationId: string, workerName: string) => {
    try {
      setProcessing(applicationId)

      const { error } = await acceptApplication(applicationId)

      if (error) throw error

      toast.success(`${workerName} одобрен!`)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Не удалось одобрить отклик')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (applicationId: string, workerName: string) => {
    try {
      setProcessing(applicationId)

      const { error } = await rejectApplication(applicationId)

      if (error) throw error

      toast.success(`Отклик от ${workerName} отклонён`)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Не удалось отклонить отклик')
    } finally {
      setProcessing(null)
    }
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Нет откликов</h3>
        <p className="text-gray-400 text-sm">
          Подождите, пока специалисты откликнутся на вашу смену
        </p>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const acceptedApplications = applications.filter(app => app.status === 'accepted')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  return (
    <div className="space-y-4">
      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <h3 className="text-lg font-bold text-white mb-4">
            Ожидают ответа ({pendingApplications.length})
          </h3>
          <div className="space-y-3">
            {pendingApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onAccept={handleAccept}
                onReject={handleReject}
                processing={processing === app.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted Applications */}
      {acceptedApplications.length > 0 && (
        <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-5">
          <h3 className="text-lg font-bold text-green-400 mb-4">
            Одобрено ({acceptedApplications.length})
          </h3>
          <div className="space-y-3">
            {acceptedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onAccept={handleAccept}
                onReject={handleReject}
                processing={processing === app.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Applications */}
      {rejectedApplications.length > 0 && (
        <details className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-white transition">
            Отклонённые ({rejectedApplications.length})
          </summary>
          <div className="space-y-3 mt-4">
            {rejectedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onAccept={handleAccept}
                onReject={handleReject}
                processing={processing === app.id}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

interface ApplicationCardProps {
  application: any
  onAccept: (id: string, name: string) => void
  onReject: (id: string, name: string) => void
  processing: boolean
}

function ApplicationCard({ application, onAccept, onReject, processing }: ApplicationCardProps) {
  const worker = application.worker

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
        {worker?.avatar_url ? (
          <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-semibold truncate">{worker?.full_name || 'Неизвестно'}</h4>
          {worker?.gosuslugi_verified && (
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{worker?.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <span>•</span>
          <span>{worker?.total_shifts || 0} смен</span>
        </div>
        {application.message && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{application.message}</p>
        )}
      </div>

      {/* Actions */}
      {application.status === 'pending' && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onAccept(application.id, worker?.full_name)}
            disabled={processing}
            className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl flex items-center justify-center transition disabled:opacity-50"
          >
            <Check className="w-5 h-5 text-green-400" />
          </button>
          <button
            onClick={() => onReject(application.id, worker?.full_name)}
            disabled={processing}
            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl flex items-center justify-center transition disabled:opacity-50"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {application.status === 'accepted' && (
        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium flex-shrink-0">
          Одобрено
        </div>
      )}

      {application.status === 'rejected' && (
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium flex-shrink-0">
          Отклонено
        </div>
      )}
    </div>
  )
}
