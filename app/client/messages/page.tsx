'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import ChatList from '@/components/messages/ChatList'
import { getChats } from '@/lib/api/messages'
import { useTelegramSession } from '@/lib/session/TelegramSessionManager'
import type { Chat } from '@/lib/api/messages'

export default function ClientMessagesPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useTelegramSession()

  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && session) {
      loadChats()
    } else if (!sessionLoading && !session) {
      router.push('/')
    }
  }, [sessionLoading, session])

  const loadChats = async () => {
    if (!session) return

    try {
      setLoading(true)

      setUserId(session.userId)

      // Load chats
      const { data, error } = await getChats(session.userId)
      if (error) {
        console.error('Error loading chats:', error)
        return
      }

      setChats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-h1 text-white">Сообщения</h1>
            {!loading && chats.length > 0 && (
              <p className="text-body-small text-gray-400">
                {chats.length} {chats.length === 1 ? 'чат' : 'чатов'}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="flex-1">
        <ChatList chats={chats} loading={loading} />
      </div>
    </main>
  )
}
