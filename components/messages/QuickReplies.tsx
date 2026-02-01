'use client'

interface QuickRepliesProps {
  userType: 'worker' | 'client'
  onSelect: (text: string) => void
  show: boolean
}

const WORKER_QUICK_REPLIES = [
  "✅ Буду вовремя",
  "⏰ Опаздываю на 10 мин",
  "📍 Я на месте",
  "✔️ Работа выполнена",
  "❓ Уточните адрес"
]

const CLIENT_QUICK_REPLIES = [
  "👍 Отлично, жду",
  "📋 Вышлю детали",
  "💰 Оплата отправлена",
  "🎯 Смена подтверждена",
  "📞 Позвоните пожалуйста"
]

export default function QuickReplies({ userType, onSelect, show }: QuickRepliesProps) {
  const replies = userType === 'worker' ? WORKER_QUICK_REPLIES : CLIENT_QUICK_REPLIES

  return (
    <div
      className={`
        overflow-x-auto pb-2 transition-all duration-300
        ${show ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
      `}
    >
      <div className="flex gap-2 px-1">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSelect(reply)}
            className="
              flex-shrink-0 px-4 py-2 rounded-full
              bg-orange-500/10 text-orange-500
              hover:bg-orange-500/20 active:scale-95
              text-sm font-medium whitespace-nowrap
              transition-all duration-200
              border border-orange-500/20
            "
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  )
}
