'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, User } from 'lucide-react'
import { getMessages, sendMessage, markMessagesAsRead, subscribeToMessages } from '@/lib/api/messages'
import { getUserById } from '@/lib/api/users'

type MessageWithSender = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  sender: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock current user ID - in production, get from auth context
  const MOCK_USER_ID = 'worker-123'

  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)

  useEffect(() => {
    loadMessages()
    markAsRead()

    // Subscribe to real-time messages
    const channel = subscribeToMessages(chatId, (newMsg) => {
      // Load full message with sender data
      loadMessages()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [chatId])

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      setLoading(true)

      const { data, error } = await getMessages(chatId)

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(data as MessageWithSender[])

        // Get other user info
        const firstMessage = data[0] as MessageWithSender
        const otherUserId = firstMessage.sender_id === MOCK_USER_ID
          ? (data.find((m: any) => m.sender_id !== MOCK_USER_ID) as MessageWithSender)?.sender_id
          : firstMessage.sender_id

        if (otherUserId) {
          const { data: userData } = await getUserById(otherUserId)
          if (userData) {
            setOtherUser(userData)
          }
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(chatId, MOCK_USER_ID)
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)

      const { error } = await sendMessage({
        conversation_id: chatId,
        sender_id: MOCK_USER_ID,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage('')
      // Messages will be updated via real-time subscription
      loadMessages()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })
    }
  }

  // Group messages by date
  const groupedMessages: { [key: string]: MessageWithSender[] } = {}
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toDateString()
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = []
    }
    groupedMessages[dateKey].push(msg)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка чата...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold">{otherUser?.full_name || 'Пользователь'}</h2>
              <p className="text-xs text-gray-400">онлайн</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groupedMessages).map((dateKey) => (
          <div key={dateKey}>
            {/* Date Divider */}
            <div className="flex items-center justify-center mb-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-xs text-gray-400">
                {formatDate(groupedMessages[dateKey][0].created_at)}
              </span>
            </div>

            {/* Messages for this date */}
            {groupedMessages[dateKey].map((message) => {
              const isCurrentUser = message.sender_id === MOCK_USER_ID

              return (
                <div
                  key={message.id}
                  className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isCurrentUser ? 'order-2' : 'order-1'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-orange-500 text-white rounded-br-sm'
                          : 'bg-white/10 backdrop-blur-xl text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        isCurrentUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Нет сообщений</p>
              <p className="text-sm text-gray-500 mt-1">Начните общение</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#2A2A2A]/80 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Сообщение..."
            rows={1}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none min-h-[48px] max-h-[120px]"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white transition shadow-lg shadow-orange-500/30 flex items-center justify-center flex-shrink-0"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Quick Replies */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            'Когда начало?',
            'Какие инструменты нужны?',
            'Согласен',
            'Спасибо!',
          ].map((reply) => (
            <button
              key={reply}
              onClick={() => setNewMessage(reply)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 whitespace-nowrap transition"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
