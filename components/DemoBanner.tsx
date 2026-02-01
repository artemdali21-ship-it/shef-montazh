'use client'

import { useState, useEffect } from 'react'
import { X, Eye } from 'lucide-react'
import Link from 'next/link'

/**
 * Demo Mode Banner
 *
 * Показывается сверху страницы когда пользователь в demo режиме.
 * Объясняет что это демо + призыв к регистрации.
 */
export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Check if user is demo
    checkDemoStatus()
  }, [])

  async function checkDemoStatus() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setIsDemo(data.user?.is_demo || false)
      }
    } catch (error) {
      console.error('Failed to check demo status:', error)
    }
  }

  if (!isDemo || !isVisible) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Eye className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Вы в демо-режиме — можете смотреть, но не можете создавать смены или откликаться
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              Зарегистрироваться
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Spacer component to push content below banner
 * Use this on pages where banner is shown
 */
export function DemoBannerSpacer() {
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    checkDemoStatus()
  }, [])

  async function checkDemoStatus() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setIsDemo(data.user?.is_demo || false)
      }
    } catch (error) {
      console.error('Failed to check demo status:', error)
    }
  }

  if (!isDemo) {
    return null
  }

  // Height of banner (py-3 = 12px top + 12px bottom + content)
  return <div className="h-16" />
}
