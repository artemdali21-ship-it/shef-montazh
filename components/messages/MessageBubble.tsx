'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Message } from '@/lib/api/messages'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            className={`
              ${message.image_url ? 'p-2' : 'px-4 py-2.5'} rounded-2xl
              ${isOwn
                ? 'bg-orange-500 text-white rounded-br-sm'
                : 'bg-white/10 text-white rounded-bl-sm'
              }
            `}
          >
            {/* Image */}
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Изображение"
                className="w-[200px] h-[200px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => setShowFullscreen(true)}
              />
            )}

            {/* Text content */}
            {message.content && (
              <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${message.image_url ? 'mt-2 px-2' : ''}`}>
                {message.content}
              </p>
            )}
          </div>
          <span className={`text-xs text-gray-500 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && message.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={message.image_url}
            alt="Изображение"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
