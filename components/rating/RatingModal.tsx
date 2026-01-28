'use client'

import React, { useState, useEffect } from 'react'
import { X, Star } from 'lucide-react'

export interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  shiftId: string
  ratedUserId: string
  ratedUserName: string
  ratedUserRole: 'worker' | 'client'
  onSubmit: (rating: number, comment: string) => Promise<void>
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  shiftId,
  ratedUserId,
  ratedUserName,
  ratedUserRole,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const maxChars = 200

  useEffect(() => {
    if (!isOpen) {
      setRating(0)
      setComment('')
      setShowSuccess(false)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (rating === 0) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(rating, comment)
      setShowSuccess(true)
      
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('[v0] Rating submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting && !showSuccess) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0.3, 1)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 24, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
          animation: showSuccess ? 'none' : 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0.3, 1)',
        }}
      >
        {!showSuccess ? (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Оцените работу {ratedUserName}
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <X size={20} color="#FFFFFF" strokeWidth={2} />
              </button>
            </div>

            {/* Star Rating */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background:
                        star <= (hoverRating || rating)
                          ? 'rgba(232, 93, 47, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)',
                      border:
                        star <= (hoverRating || rating)
                          ? '1.5px solid rgba(232, 93, 47, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Star
                      size={28}
                      fill={
                        star <= (hoverRating || rating)
                          ? '#E85D2F'
                          : '#666'
                      }
                      color={
                        star <= (hoverRating || rating)
                          ? '#E85D2F'
                          : '#666'
                      }
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#BFFF00',
                    fontFamily: "'Montserrat', sans-serif",
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  {rating} из 5
                </p>
              )}
            </div>

            {/* Comment Field */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Ваш комментарий (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setComment(e.target.value)
                  }
                }}
                placeholder="Расскажите о работе..."
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  padding: '12px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(232, 93, 47, 0.4)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#FFFFFF/60',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {comment.length}/{maxChars}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                background:
                  rating === 0
                    ? 'rgba(191, 255, 0, 0.1)'
                    : 'linear-gradient(135deg, #BFFF00 0%, #99CC00 100%)',
                border: 'none',
                color: rating === 0 ? '#FFFFFF/40' : '#1A1A1A',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: "'Montserrat', sans-serif",
                cursor: rating === 0 || isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (rating > 0 && !isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(191, 255, 0, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid rgba(26, 26, 26, 0.3)',
                      borderTopColor: '#1A1A1A',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Отправка...
                </>
              ) : (
                'Отправить оценку'
              )}
            </button>
          </>
        ) : (
          /* Success State */
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(191, 255, 0, 0.2)',
                border: '2px solid #BFFF00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 16L13 23L26 10"
                  stroke="#BFFF00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '8px',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Спасибо за оценку!
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#FFFFFF/70',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Ваше мнение помогает улучшить качество работ
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
