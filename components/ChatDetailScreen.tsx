'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Phone, MoreVertical, Send, Paperclip, MapPin, Camera, Smile, Check, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  sender: 'me' | 'other'
  text: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

export default function ChatDetailScreen({
  chatId,
  chatName,
  chatType,
  onBack,
}: {
  chatId: string
  chatName: string
  chatType: 'client' | 'shef'
  onBack: () => void
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'other',
      text: 'Здравствуйте! Подскажите, у вас есть свой инструмент?',
      timestamp: '10:30',
      status: 'read',
    },
    {
      id: '2',
      sender: 'me',
      text: 'Да, есть полный набор. Дрель, шуруповерт, ключи.',
      timestamp: '10:32',
      status: 'read',
    },
    {
      id: '3',
      sender: 'other',
      text: 'Отлично! Тогда жду вас завтра в 10:00 по адресу: Экспоцентр, павильон 7.',
      timestamp: '10:35',
      status: 'read',
    },
    {
      id: '4',
      sender: 'me',
      text: 'Хорошо, буду! А оплата как будет — наличными или через СЗ?',
      timestamp: '10:40',
      status: 'delivered',
    },
    {
      id: '5',
      sender: 'other',
      text: 'Через самозанятых, как обычно. Чек на 2500₽ после завершения.',
      timestamp: '15:30',
      status: 'read',
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: message,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }

    setMessages([...messages, newMessage])
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-dashboard flex flex-col">
      {/* Header */}
      <header className="bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10 z-20">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  chatType === 'client' ? 'bg-[#E85D2F] text-white' : 'bg-[#BFFF00] text-black'
                }`}>
                  {chatName.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#BFFF00] border-2 border-[#2A2A2A] rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white truncate">{chatName}</h2>
                <p className="text-xs text-[#BFFF00] font-semibold">онлайн</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Shift Context Banner */}
        <div className="bg-[#FFD60A]/10 border-y border-[#FFD60A]/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFD60A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#FFD60A]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#FFD60A] font-bold uppercase tracking-wide">Активная смена</p>
              <p className="text-sm text-white font-semibold truncate">Монтаж выставочного стенда</p>
            </div>
            <button className="text-xs text-[#FFD60A] font-bold underline flex-shrink-0">Детали</button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Date Divider */}
        <div className="flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
            <span className="text-xs text-[#9B9B9B] font-semibold">Сегодня</span>
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.sender === 'me'
                    ? 'bg-[#E85D2F] text-white rounded-tr-sm'
                    : 'bg-white/10 text-white rounded-tl-sm'
                }`}
              >
                <p className="font-medium text-sm leading-relaxed">{msg.text}</p>
              </div>

              <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-[#6B6B6B] font-medium">{msg.timestamp}</span>
                {msg.sender === 'me' && (
                  <>
                    {msg.status === 'sent' && <Check className="w-3 h-3 text-[#6B6B6B]" strokeWidth={1.5} />}
                    {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-[#6B6B6B]" strokeWidth={1.5} />}
                    {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-[#BFFF00]" strokeWidth={1.5} />}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white/5 border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <MapPin className="w-4 h-4 text-[#FFD60A]" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-white">Локация</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <Camera className="w-4 h-4 text-[#9B9B9B]" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-white">Фото</span>
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-[#2A2A2A]/90 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center flex-shrink-0 hover:bg-white/10 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-[#9B9B9B]" strokeWidth={1.5} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-[#6B6B6B] font-medium text-sm focus:outline-none focus:border-[#E85D2F]/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white/10 rounded p-1 transition-colors">
              <Smile className="w-5 h-5 text-[#9B9B9B]" strokeWidth={1.5} />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              message.trim() ? 'bg-[#E85D2F] hover:bg-[#D94D1F] active:scale-95' : 'bg-white/5 cursor-not-allowed'
            }`}
          >
            <Send className={`w-5 h-5 ${message.trim() ? 'text-white' : 'text-[#6B6B6B]'}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
