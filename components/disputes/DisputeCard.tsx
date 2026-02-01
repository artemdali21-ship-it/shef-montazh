import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'

const REASONS = {
  no_show: { label: 'Не вышел на смену', icon: '🚫', color: 'text-red-400' },
  late: { label: 'Опоздание', icon: '⏰', color: 'text-yellow-400' },
  damage: { label: 'Порча оборудования', icon: '💥', color: 'text-orange-400' },
  quality: { label: 'Некачественная работа', icon: '⚠️', color: 'text-yellow-400' },
  payment: { label: 'Проблема с оплатой', icon: '💰', color: 'text-green-400' },
  other: { label: 'Другое', icon: '📝', color: 'text-gray-400' }
}

const STATUSES = {
  open: { label: 'Открыт', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  in_review: { label: 'На рассмотрении', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  resolved: { label: 'Решён', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  rejected: { label: 'Отклонён', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
}

interface Dispute {
  id: string
  shift_id: string | null
  created_by: string
  against_user: string
  reason: keyof typeof REASONS
  description: string
  status: keyof typeof STATUSES
  admin_notes: string | null
  resolution: string | null
  created_at: string
  resolved_at: string | null
  shift?: {
    title: string
    date: string
  }
  creator?: {
    full_name: string
  }
  against?: {
    full_name: string
  }
}

interface Props {
  dispute: Dispute
  currentUserId: string
}

export default function DisputeCard({ dispute, currentUserId }: Props) {
  const reasonConfig = REASONS[dispute.reason]
  const statusConfig = STATUSES[dispute.status]
  const StatusIcon = statusConfig.icon

  const isCreator = dispute.created_by === currentUserId
  const otherParty = isCreator ? dispute.against : dispute.creator

  return (
    <Link
      href={`/disputes/${dispute.id}`}
      className="block bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{reasonConfig.icon}</span>
            <h3 className={`text-lg font-bold ${reasonConfig.color}`}>
              {reasonConfig.label}
            </h3>
          </div>
          {dispute.shift && (
            <p className="text-gray-400 text-sm">
              Смена: {dispute.shift.title}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {dispute.description}
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500 text-xs">
              {isCreator ? 'Ответчик' : 'Заявитель'}
            </p>
            <p className="text-white font-medium">
              {otherParty?.full_name || 'Неизвестно'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500 text-xs">Создан</p>
            <p className="text-white font-medium">
              {format(new Date(dispute.created_at), 'd MMM yyyy', { locale: ru })}
            </p>
          </div>
        </div>
      </div>

      {/* Resolution */}
      {dispute.resolution && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-green-400 mb-1 font-medium">Решение</p>
          <p className="text-sm text-green-400 line-clamp-2">{dispute.resolution}</p>
        </div>
      )}

      {/* Admin Notes */}
      {dispute.admin_notes && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-400 mb-1 font-medium">Заметки администратора</p>
          <p className="text-sm text-blue-400 line-clamp-2">{dispute.admin_notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          ID: {dispute.id.slice(0, 8)}...
        </span>
        <span className="text-orange-400 font-medium flex items-center gap-2 text-sm">
          Подробнее
          <Eye className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
