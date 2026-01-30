'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Search, User } from 'lucide-react'
import { getConversations } from '@/lib/api/messages'
import { getUserById } from '@/lib/api/users'

type ConversationWithDetails = {
  id: string
  participant_ids: string[]
  updated_at: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  otherUser?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export default function MessagesPage() {
  const router = useRouter()

  // Mock current user ID - in production, get from auth context
  const MOCK_USER_ID = 'worker-123'

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)

      const { data, error } = await getConversations(MOCK_USER_ID)

      if (error) throw error

      if (data) {
        // Process conversations and load participant details
        const processedConversations = await Promise.all(
          data.map(async (conv: any) => {
            // Get other participant
            const otherUserId = conv.participant_ids.find((id: string) => id !== MOCK_USER_ID)

            let otherUser = undefined
            if (otherUserId) {
              const { data: userData } = await getUserById(otherUserId)
              if (userData) {
                otherUser = {
                  id: userData.id,
                  full_name: userData.full_name,
                  avatar_url: userData.avatar_url,
                }
              }
            }

            // Get last message and unread count
            const messages = conv.messages || []
            const lastMsg = messages[messages.length - 1]
            const unreadCount = messages.filter(
              (msg: any) => !msg.is_read && msg.sender_id !== MOCK_USER_ID
            ).length

            return {
              id: conv.id,
              participant_ids: conv.participant_ids,
              updated_at: conv.updated_at,
              lastMessage: lastMsg?.content || '',
              lastMessageTime: lastMsg?.created_at || conv.updated_at,
              unreadCount,
              otherUser,
            }
          })
        )

        setConversations(processedConversations)
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins}м назад`
    if (diffHours < 24) return `${diffHours}ч назад`
    if (diffDays < 7) return `${diffDays}д назад`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка сообщений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Сообщения</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет сообщений'}
            </h3>
            <p className="text-gray-400">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Начните общаться с работниками или заказчиками'}
            </p>
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => router.push(`/messages/${conversation.id}`)}
              className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition text-left"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {conversation.otherUser?.avatar_url ? (
                    <img
                      src={conversation.otherUser.avatar_url}
                      alt={conversation.otherUser.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {conversation.otherUser?.full_name || 'Пользователь'}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessageTime || conversation.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.lastMessage || 'Нет сообщений'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
