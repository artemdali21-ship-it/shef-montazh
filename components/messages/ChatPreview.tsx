import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Chat } from '@/lib/api/messages'

interface ChatPreviewProps {
  chat: Chat
}

export default function ChatPreview({ chat }: ChatPreviewProps) {
  const router = useRouter()

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Только что'
    if (diffMins < 60) return `${diffMins} мин`
    if (diffHours < 24) return `${diffHours} ч`
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн`

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const isUnread = chat.unread_count > 0

  return (
    <div
      onClick={() => router.push(`/messages/${chat.partner_id}`)}
      className={`
        p-4 flex items-center gap-3 cursor-pointer transition-all
        border-b border-white/10
        hover:bg-white/5
        ${isUnread ? 'bg-orange-500/5' : ''}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          {chat.partner_avatar ? (
            <img
              src={chat.partner_avatar}
              alt={chat.partner_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        {isUnread && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {chat.unread_count > 9 ? '9+' : chat.unread_count}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-base ${isUnread ? 'font-bold text-white' : 'font-semibold text-white/90'}`}>
            {chat.partner_name}
          </h3>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatTime(chat.last_message_time)}
          </span>
        </div>
        <p className={`text-sm truncate ${isUnread ? 'text-white/80 font-medium' : 'text-gray-400'}`}>
          {chat.last_message}
        </p>
      </div>
    </div>
  )
}
