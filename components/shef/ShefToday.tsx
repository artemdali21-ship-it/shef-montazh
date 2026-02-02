'use client'

interface ShefTodayProps {
  shifts: any[]
}

export default function ShefToday({ shifts = [] }: ShefTodayProps) {
  if (shifts.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <p className="text-gray-400">Сегодня нет запланированных смен</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {shifts.map(shift => (
        <div key={shift.id} className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-white">{shift.title}</h3>
              <p className="text-sm text-gray-400">{shift.start_time} - {shift.end_time}</p>
              <p className="text-xs text-gray-500 mt-1">📍 {shift.location_address}</p>
            </div>
            <span className="text-lg font-bold text-green-400">{shift.pay_amount}₽</span>
          </div>

          {/* Люди на смене */}
          <div className="space-y-2 mt-4">
            <p className="text-xs text-gray-400 mb-2">Исполнители:</p>
            {shift.shift_assignments?.map((worker: any) => (
              <div key={worker.worker_id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                <span className="text-white text-sm">{worker.users?.full_name || 'Неизвестно'}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    worker.status === 'checked_in'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {worker.status === 'checked_in' ? '✅ На месте' : '⏳ Ожидание'}
                </span>
              </div>
            ))}
            {(!shift.shift_assignments || shift.shift_assignments.length === 0) && (
              <p className="text-sm text-gray-500">Нет назначенных исполнителей</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
