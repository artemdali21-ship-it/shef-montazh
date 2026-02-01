'use client'

import { useState, useEffect } from 'react'
import { Search, MessageSquare } from 'lucide-react'
import ChatPreview from './ChatPreview'
import EmptyState from '@/components/ui/EmptyState'
import type { Chat } from '@/lib/api/messages'

interface ChatListProps {
  chats: Chat[]
  loading?: boolean
}

export default function ChatList({ chats, loading }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = chats.filter(chat =>
      chat.partner_name.toLowerCase().includes(query) ||
      chat.last_message.toLowerCase().includes(query)
    )
    setFilteredChats(filtered)
  }, [searchQuery, chats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени или сообщению..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={searchQuery ? 'Ничего не найдено' : 'Нет сообщений'}
            description={searchQuery
              ? 'Попробуйте изменить запрос'
              : 'Здесь появятся ваши чаты'}
            variant="compact"
          />
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <ChatPreview key={chat.partner_id} chat={chat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
