'use client'

import React, { useState } from 'react'
import { X, Star } from 'lucide-react'

export interface RatingModalProps {
  isOpen: boolean
  userRole: 'client' | 'worker'
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  userRole,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      onSubmit(rating, comment)
      setRating(0)
      setComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'slideUp 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px 24px 0 0',
          padding: '32px 24px 24px',
          maxHeight: '85vh',
          overflowY: 'auto',
          width: '100%',
          maxWidth: '600px',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              margin: 0,
            }}
          >
            {userRole === 'client' ? 'Оцените рабочего' : 'Оцените клиента'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <X size={20} color="#FFFFFF" />
          </button>
        </div>

        {/* Rating Stars */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '40px',
                  padding: '8px',
                  transition: 'all 0.2s',
                  transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <Star
                  size={40}
                  color={star <= rating ? '#FFD60A' : '#666666'}
                  fill={star <= rating ? '#FFD60A' : 'none'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              margin: 0,
            }}
          >
            {rating === 0 && 'Выберите оценку'}
            {rating === 1 && 'Плохо'}
            {rating === 2 && 'Удовлетворительно'}
            {rating === 3 && 'Хорошо'}
            {rating === 4 && 'Очень хорошо'}
            {rating === 5 && 'Отлично'}
          </p>
        </div>

        {/* Comment Input */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#9B9B9B',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
          >
            Комментарий (опционально)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Поделитесь впечатлением о работе..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          style={{
            width: '100%',
            height: '52px',
            background: rating === 0 ? 'rgba(232, 93, 47, 0.4)' : 'linear-gradient(135deg, #E85D2F 0%, #D94D1F 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '12px',
            border: 'none',
            cursor: rating === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            opacity: rating === 0 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (rating > 0 && !isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(232, 93, 47, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
        </button>

        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
