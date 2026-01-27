'use client'

import React, { useState } from 'react'
import { CheckCircle2, CheckCircle, Loader2 } from 'lucide-react'

export interface CompletionActionsProps {
  shiftStatus: 'checked_in' | 'awaiting_worker_confirm' | 'awaiting_rating' | 'completed'
  userRole: 'client' | 'worker'
  onCompleteShift: () => void
  onConfirmCompletion: () => void
  onRatingOpen: () => void
}

export const CompletionActions: React.FC<CompletionActionsProps> = ({
  shiftStatus,
  userRole,
  onCompleteShift,
  onConfirmCompletion,
  onRatingOpen,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClientComplete = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      onCompleteShift()
    } finally {
      setIsLoading(false)
    }
  }

  const handleWorkerConfirm = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      onConfirmCompletion()
      onRatingOpen()
    } finally {
      setIsLoading(false)
    }
  }

  // Client view: Show completion button when shift is checked in
  if (userRole === 'client' && shiftStatus === 'checked_in') {
    return (
      <section style={{ marginBottom: '24px' }}>
        <button
          onClick={handleClientComplete}
          disabled={isLoading}
          style={{
            width: '100%',
            height: '56px',
            background: isLoading ? 'rgba(232, 93, 47, 0.6)' : 'linear-gradient(135deg, #E85D2F 0%, #D94D1F 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '16px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            boxShadow: '0 8px 24px rgba(232, 93, 47, 0.3)',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Завершение...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Завершить смену</span>
            </>
          )}
        </button>
      </section>
    )
  }

  // Worker view: Show confirmation button when awaiting worker confirm
  if (userRole === 'worker' && shiftStatus === 'awaiting_worker_confirm') {
    return (
      <section style={{ marginBottom: '24px' }}>
        <button
          onClick={handleWorkerConfirm}
          disabled={isLoading}
          style={{
            width: '100%',
            height: '56px',
            background: isLoading ? 'rgba(191, 255, 0, 0.6)' : 'linear-gradient(135deg, #BFFF00 0%, #A3D900 100%)',
            color: '#0F172A',
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '16px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            boxShadow: '0 8px 24px rgba(191, 255, 0, 0.3)',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Подтверждение...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Подтвердить завершение</span>
            </>
          )}
        </button>
      </section>
    )
  }

  // Both confirmed: Show success state
  if (shiftStatus === 'awaiting_rating' || shiftStatus === 'completed') {
    return (
      <section
        style={{
          marginBottom: '24px',
          background: 'rgba(191, 255, 0, 0.1)',
          border: '2px solid rgba(191, 255, 0, 0.4)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '40px' }}>
          <CheckCircle size={40} color="#BFFF00" fill="#BFFF00" />
        </div>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#BFFF00',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            margin: 0,
          }}
        >
          Смена завершена!
        </h3>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#FFFFFF',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            margin: 0,
          }}
        >
          Оцените друг друга
        </p>
        <button
          onClick={onRatingOpen}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: 'rgba(191, 255, 0, 0.2)',
            border: '1px solid rgba(191, 255, 0, 0.5)',
            borderRadius: '10px',
            color: '#BFFF00',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(191, 255, 0, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(191, 255, 0, 0.2)'
          }}
        >
          Открыть оценку
        </button>
      </section>
    )
  }

  return null
}
