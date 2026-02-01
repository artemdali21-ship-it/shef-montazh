'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  DollarSign,
  AlertTriangle,
  Clock,
  FileText,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ResolveDisputeModal from './ResolveDisputeModal'

const REASONS = {
  no_show: { label: 'Не вышел на смену', icon: '🚫', color: 'text-red-400' },
  late: { label: 'Опоздание', icon: '⏰', color: 'text-yellow-400' },
  damage: { label: 'Порча оборудования', icon: '💥', color: 'text-orange-400' },
  quality: { label: 'Некачественная работа', icon: '⚠️', color: 'text-yellow-400' },
  payment: { label: 'Проблема с оплатой', icon: '💰', color: 'text-green-400' },
  other: { label: 'Другое', icon: '📝', color: 'text-gray-400' }
}

const STATUSES = {
  open: { label: 'Открыт', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
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
  shift?: any
  creator?: any
  against?: any
  resolver?: any
}

interface Props {
  dispute: Dispute
}

export default function DisputeDetailsClient({ dispute }: Props) {
  const [showResolveModal, setShowResolveModal] = useState(false)

  const reasonConfig = REASONS[dispute.reason]
  const statusConfig = STATUSES[dispute.status]
  const StatusIcon = statusConfig.icon

  const canResolve = dispute.status === 'open' || dispute.status === 'in_review'

  const renderUserCard = (user: any, title: string) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xl font-bold text-white">{user.full_name}</h4>
            {(user.role === 'admin' || user.role === 'shef') && (
              <Shield className="w-5 h-5 text-orange-400" />
            )}
          </div>
          <p className="text-sm text-gray-400 capitalize mb-2">{user.role}</p>

          <div className="space-y-1">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/admin/users/${user.id}`}
        className="block w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-center font-medium transition"
      >
        Открыть профиль
      </Link>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/disputes"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад к списку споров</span>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">{reasonConfig.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Спор #{dispute.id.slice(0, 8)}</h1>
              <p className={`text-lg ${reasonConfig.color} font-medium`}>{reasonConfig.label}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dispute Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Описание проблемы</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {/* Shift Info */}
          {dispute.shift && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Информация о смене</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Название</p>
                    <p className="text-white font-medium">{dispute.shift.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Дата</p>
                    <p className="text-white font-medium">
                      {format(new Date(dispute.shift.date), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>

                {dispute.shift.location_address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Место</p>
                      <p className="text-white font-medium">{dispute.shift.location_address}</p>
                    </div>
                  </div>
                )}

                {dispute.shift.pay_amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Оплата</p>
                      <p className="text-white font-medium">
                        {dispute.shift.pay_amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/admin/shifts/${dispute.shift_id}`}
                className="block w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-center font-medium transition"
              >
                Открыть смену
              </Link>
            </div>
          )}

          {/* Resolution */}
          {dispute.resolution && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Решение</h3>
              <p className="text-green-300 leading-relaxed whitespace-pre-wrap mb-3">
                {dispute.resolution}
              </p>
              {dispute.resolver && (
                <p className="text-sm text-green-400/70">
                  Решение принято: {dispute.resolver.full_name}
                </p>
              )}
              {dispute.resolved_at && (
                <p className="text-sm text-green-400/70">
                  {format(new Date(dispute.resolved_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              )}
            </div>
          )}

          {/* Admin Notes */}
          {dispute.admin_notes && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Заметки администратора</h3>
              <p className="text-blue-300 leading-relaxed whitespace-pre-wrap">
                {dispute.admin_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Users & Actions */}
        <div className="space-y-6">
          {/* Participants */}
          {dispute.creator && renderUserCard(dispute.creator, 'Заявитель')}
          {dispute.against && renderUserCard(dispute.against, 'Ответчик')}

          {/* Metadata */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Информация</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">ID спора</p>
                <p className="text-white font-mono">{dispute.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Создан</p>
                <p className="text-white">
                  {format(new Date(dispute.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
              {dispute.resolved_at && (
                <div>
                  <p className="text-gray-400">Решён</p>
                  <p className="text-white">
                    {format(new Date(dispute.resolved_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {canResolve && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
            >
              Разрешить спор
            </button>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <ResolveDisputeModal
          disputeId={dispute.id}
          shiftId={dispute.shift_id}
          onClose={() => setShowResolveModal(false)}
        />
      )}
    </div>
  )
}
