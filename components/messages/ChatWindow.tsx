'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import EmptyState from '@/components/ui/EmptyState'
import { getMessages, sendMessage, markMessagesAsRead, uploadChatImage } from '@/lib/api/messages'
import { createClient } from '@/lib/supabase-client'
import type { Message } from '@/lib/api/messages'

interface ChatWindowProps {
  currentUserId: string
  partnerId: string
  partnerName: string
  partnerAvatar?: string | null
  userType: 'worker' | 'client'
}

export default function ChatWindow({
  currentUserId,
  partnerId,
  partnerName,
  partnerAvatar,
  userType
}: ChatWindowProps) {
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [currentUserId, partnerId])

  // Set up Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user_id=eq.${currentUserId}`
      }, (payload) => {
        const newMessage = payload.new as Message
        if (newMessage.from_user_id === partnerId) {
          setMessages(prev => [...prev, newMessage])
          markMessagesAsRead(currentUserId, partnerId)
          // Auto-scroll to bottom
          setTimeout(scrollToBottom, 100)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, partnerId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)

      // Load message history
      const { data, error } = await getMessages(currentUserId, partnerId)
      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data)

      // Mark messages as read
      await markMessagesAsRead(currentUserId, partnerId)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string, image?: File) => {
    try {
      setSending(true)

      let imageUrl: string | undefined = undefined

      // Upload image if provided
      if (image) {
        const { url, error: uploadError } = await uploadChatImage(image, currentUserId)
        if (uploadError || !url) {
          console.error('Error uploading image:', uploadError)
          alert('Не удалось загрузить изображение')
          return
        }
        imageUrl = url
      }

      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        from_user_id: currentUserId,
        to_user_id: partnerId,
        content,
        image_url: imageUrl || null,
        is_read: false,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempMessage])

      // Send to server
      const { data, error } = await sendMessage(currentUserId, partnerId, content, imageUrl)
      if (error) {
        console.error('Error sending message:', error)
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
        return
      }

      // Replace temp message with real one
      if (data) {
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? data : m)
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Partner Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              {partnerAvatar ? (
                <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{partnerName}</h1>
              <p className="text-xs text-gray-400">в сети</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ paddingBottom: '20px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={User}
            title="Начните переписку"
            description="Отправьте первое сообщение"
            variant="compact"
          />
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.from_user_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput onSend={handleSendMessage} disabled={sending} userType={userType} />
      </div>
    </div>
  )
}
