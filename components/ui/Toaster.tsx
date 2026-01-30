'use client'

import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#BFFF00',
            secondary: '#1A1A1A',
          },
          style: {
            border: '1px solid rgba(191, 255, 0, 0.3)',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#1A1A1A',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#E85D2F',
            secondary: '#1A1A1A',
          },
        },
      }}
    />
  )
}
