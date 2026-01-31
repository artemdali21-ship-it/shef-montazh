'use client'

import { useState, useEffect } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function BotActivationBanner() {
  const supabase = createClient()
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkBotActivation()
    // Check again when window regains focus (after Telegram redirect)
    window.addEventListener('focus', checkBotActivation)
    return () => window.removeEventListener('focus', checkBotActivation)
  }, [])

  const checkBotActivation = async () => {
    try {
      // Check if banner was dismissed this session
      const dismissed = sessionStorage.getItem('bot_banner_dismissed')
      if (dismissed === 'true') {
        setVisible(false)
        setChecking(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setVisible(false)
        setChecking(false)
        return
      }

      // Check if user has telegram_id
      const { data: userData } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', user.id)
        .single()

      if (!userData?.telegram_id) {
        setVisible(false)
        setChecking(false)
        return
      }

      // Check if bot is activated (any notification sent)
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      // Show banner if telegram_id exists but no notifications yet
      const shouldShow = userData.telegram_id && (!notifications || notifications.length === 0)
      setVisible(shouldShow)
    } catch (error) {
      console.error('Error checking bot activation:', error)
      setVisible(false)
    } finally {
      setChecking(false)
    }
  }

  const handleActivate = () => {
    // Open Telegram bot in new tab
    window.open('https://t.me/shef_montazh_bot?start=welcome', '_blank')

    // Check activation after a delay
    setTimeout(() => {
      checkBotActivation()
    }, 3000)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('bot_banner_dismissed', 'true')
    setVisible(false)
  }

  if (checking || !visible) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon & Text */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Bell className="w-5 h-5 text-white flex-shrink-0 animate-pulse" />
              <p className="text-white text-sm font-medium truncate">
                Активируйте уведомления чтобы не пропустить важное
              </p>
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleActivate}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-orange-600 rounded-lg font-semibold text-sm transition flex items-center gap-2 whitespace-nowrap"
              >
                Активировать
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
