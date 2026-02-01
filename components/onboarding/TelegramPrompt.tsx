import { Send, ChevronLeft, Check } from 'lucide-react'

interface Props {
  onComplete: () => void
  onBack: () => void
}

export default function TelegramPrompt({ onComplete, onBack }: Props) {
  const telegramLink = 'https://t.me/shef_montazh_bot?start=welcome'

  const handleOpenTelegram = () => {
    window.open(telegramLink, '_blank')
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Назад</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
          <Send className="w-10 h-10 text-blue-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Подключите Telegram 📱
        </h1>
        <p className="text-gray-400">
          Получайте уведомления о новых сменах и сообщениях
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Что вы получите:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            <p className="text-sm text-gray-300">
              Мгновенные уведомления о новых сменах
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            <p className="text-sm text-gray-300">
              Уведомления о сообщениях от заказчиков
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            <p className="text-sm text-gray-300">
              Напоминания о check-in перед сменой
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleOpenTelegram}
          className="
            w-full py-4 bg-blue-500 text-white rounded-xl
            hover:bg-blue-600 active:scale-95
            transition-all duration-200 font-bold text-lg
            flex items-center justify-center gap-2
          "
        >
          <Send className="w-5 h-5" />
          Открыть Telegram
        </button>

        <button
          onClick={onComplete}
          className="
            w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl
            hover:bg-white/10 transition-all duration-200 font-medium
          "
        >
          Пропустить
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Вы всегда сможете подключить Telegram позже в настройках
      </p>
    </div>
  )
}
