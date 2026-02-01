'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import QuickReplies from './QuickReplies'

interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => void
  disabled?: boolean
  userType: 'worker' | 'client'
}

export default function MessageInput({ onSend, disabled, userType }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const content = message.trim()
    if ((!content && !selectedImage) || disabled) return

    onSend(content, selectedImage || undefined)
    setMessage('')
    setSelectedImage(null)
    setImagePreview(null)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 5MB')
      return
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Неподдерживаемый формат. Используйте JPEG, PNG или WebP')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleQuickReply = (text: string) => {
    setMessage(text)
    textareaRef.current?.focus()

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="border-t border-white/10 bg-[#2A2A2A]/80 backdrop-blur-xl">
      {/* Quick Replies */}
      <div className="px-4 pt-3">
        <QuickReplies
          userType={userType}
          onSelect={handleQuickReply}
          show={isFocused && !message && !selectedImage}
        />
      </div>

      <div className="p-4">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-white/20"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Paperclip button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="
            flex-shrink-0 w-12 h-12 flex items-center justify-center
            bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed
            border border-white/10 rounded-xl transition-all
          "
        >
          <Paperclip className="w-5 h-5 text-gray-400" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Напишите сообщение..."
          disabled={disabled}
          rows={1}
          className="
            flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-orange-500
            resize-none overflow-y-auto
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || disabled}
          className="
            flex-shrink-0 w-12 h-12 flex items-center justify-center
            bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed
            rounded-xl transition-all
          "
        >
          <Send className="w-5 h-5 text-white" />
        </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter для отправки, Shift+Enter для новой строки
        </p>
      </div>
    </div>
  )
}
