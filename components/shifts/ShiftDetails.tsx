import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  Shield,
  Wrench,
  User,
  Briefcase,
  CheckCircle
} from 'lucide-react'

interface ShiftDetailsProps {
  shift: any
  client?: any
  showClient?: boolean
}

export default function ShiftDetails({ shift, client, showClient = false }: ShiftDetailsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || ''
  }

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium mb-3">
            {shift.category}
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">{shift.title}</h1>
          {shift.status === 'open' && (
            <div className="inline-flex items-center gap-1 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Открыта для откликов</span>
            </div>
          )}
        </div>

        {/* Pay Amount */}
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Оплата</p>
            <p className="text-2xl font-bold text-white">
              {shift.pay_amount?.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      </div>

      {/* Client Info (for worker view) */}
      {showClient && client && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <p className="text-xs text-gray-400 mb-3">Заказчик</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{client.full_name}</h3>
                {client.gosuslugi_verified && (
                  <Shield className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-300">{client.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{client.total_shifts || 0} смен</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Info */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Локация</p>
              <p className="text-white font-medium">{shift.location_address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Дата</p>
              <p className="text-white font-medium">{formatDate(shift.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Время</p>
              <p className="text-white font-medium">
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </p>
            </div>
          </div>

          {shift.required_workers > 1 && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Требуется</p>
                <p className="text-white font-medium">{shift.required_workers} человек</p>
              </div>
            </div>
          )}

          {shift.required_rating > 0 && (
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Минимальный рейтинг</p>
                <p className="text-white font-medium">{shift.required_rating}+</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {shift.description && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-3">Описание</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {shift.description}
          </p>
        </div>
      )}

      {/* Tools Required */}
      {shift.tools_required && shift.tools_required.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-orange-400" />
            <p className="text-white font-semibold">Требуемые инструменты</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {shift.tools_required.map((tool: string, index: number) => (
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

      {/* Requirements */}
      <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <p className="text-white font-semibold">Требования</p>
        </div>
        <ul className="space-y-2">
          {shift.required_rating > 0 ? (
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Рейтинг не ниже {shift.required_rating}</span>
            </li>
          ) : (
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Подходит для начинающих</span>
            </li>
          )}
          <li className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span>Приходить вовремя</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span>Выполнять работу качественно</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
