'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import ChatList from '@/components/messages/ChatList'
import { getChats } from '@/lib/api/messages'
import { createClient } from '@/lib/supabase-client'
import type { Chat } from '@/lib/api/messages'

export default function WorkerMessagesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserId(user.id)

      // Load chats
      const { data, error } = await getChats(user.id)
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
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
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
