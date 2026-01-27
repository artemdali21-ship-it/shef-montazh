'use client'

import { useState } from 'react'
import { Search, MessageCircle, ChevronRight, Building2, User, Clock } from 'lucide-react'

interface Chat {
  id: string
  name: string
  type: 'client' | 'shef'
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  shiftTitle?: string
}

export default function MessagesListScreen({ onSelectChat }: { onSelectChat: (chatId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const unreadCount = 3; // Declare unreadCount variable

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Decor Factory',
      type: 'client',
      avatar: 'DF',
      lastMessage: 'Отлично, жду вас завтра в 10:00',
      timestamp: '15:30',
      unread: 0,
      online: true,
      shiftTitle: 'Монтаж выставочного стенда',
    },
    {
      id: '2',
      name: 'Игорь Петров',
      type: 'shef',
      avatar: 'ИП',
      lastMessage: 'Не забудь взять свой инструмент',
      timestamp: '14:20',
      unread: 2,
      online: false,
      shiftTitle: 'Монтаж выставочного стенда',
    },
    {
      id: '3',
      name: 'Event Masters',
      type: 'client',
      avatar: 'EM',
      lastMessage: 'Можешь выйти в субботу?',
      timestamp: 'Вчера',
      unread: 1,
      online: false,
      shiftTitle: undefined,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] relative">
      {/* DECORATIVE ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <img src="/images/chain.png" className="absolute top-20 left-10 w-20 h-20" alt="" />
        <img src="/images/wrench.png" className="absolute bottom-20 right-10 w-24 h-24 opacity-50" alt="" />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10 z-20">
        <div className="h-16 flex items-center justify-between px-4">
          <h1 className="text-white font-bold text-xl">Сообщения</h1>
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E85D2F] rounded-full text-white text-xs font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9B]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Поиск по сообщениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder:text-[#6B6B6B] font-medium text-sm focus:outline-none focus:border-[#E85D2F]/50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'Все', count: 3 },
            { id: 'unread', label: 'Непрочитанные', count: 3 },
            { id: 'clients', label: 'Заказчики', count: 2 },
            { id: 'workers', label: 'Бригада', count: 1 },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-[#E85D2F] text-white'
                  : 'bg-white/5 text-[#9B9B9B] hover:bg-white/10'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-1 ${activeFilter === filter.id ? 'text-white' : 'text-[#E85D2F]'}`}>
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Chats List */}
      <div className="pb-20">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="w-full border-b border-white/5 hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3 p-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                    chat.type === 'client' ? 'bg-[#E85D2F] text-white' : 'bg-[#BFFF00] text-black'
                  }`}
                >
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#BFFF00] border-2 border-[#2A2A2A] rounded-full"></div>
                )}
                {chat.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#E85D2F] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{chat.unread}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate">{chat.name}</h3>
                    {chat.type === 'client' ? (
                      <Building2 className="w-3 h-3 text-[#9B9B9B] flex-shrink-0" />
                    ) : (
                      <User className="w-3 h-3 text-[#9B9B9B] flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-[#9B9B9B] font-medium flex-shrink-0">{chat.timestamp}</span>
                </div>

                {chat.shiftTitle && (
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-[#FFD60A]" />
                    <span className="text-xs text-[#FFD60A] font-semibold truncate">{chat.shiftTitle}</span>
                  </div>
                )}

                <p
                  className={`text-sm truncate ${
                    chat.unread > 0 ? 'text-white font-semibold' : 'text-[#9B9B9B] font-medium'
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-[#9B9B9B]" />
          </div>
          <h3 className="font-bold text-lg text-white mb-2">Нет сообщений</h3>
          <p className="text-center text-[#9B9B9B] font-medium text-sm">
            Здесь будут отображаться ваши диалоги с заказчиками и коллегами
          </p>
        </div>
      )}
    </div>
  )
}
