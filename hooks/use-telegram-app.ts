'use client'

import { useEffect, useState, useCallback } from 'react'

interface WebApp {
  ready: () => void
  expand: () => void
  close: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  showAlert: (message: string) => void
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void
  showPopup: (params: any, callback?: (buttonId: string) => void) => void
  requestPhone: (callback: (shared: boolean) => void) => void
  sendData: (data: string) => void
  MainButton: {
    text: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: () => void
    hideProgress: () => void
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  platform: string
  colorScheme: string
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  initData: string
  initDataUnsafe: any
  version: string
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  bottomSafeAreaInset: number
}

export const useTelegramApp = () => {
  const [webapp, setWebapp] = useState<WebApp | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const app = (window as any).Telegram?.WebApp
      if (app) {
        setWebapp(app)
        setIsReady(true)
      }
    }
  }, [])

  const showAlert = useCallback((message: string) => {
    if (webapp) {
      webapp.showAlert(message)
    }
  }, [webapp])

  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    if (webapp) {
      webapp.showConfirm(message, callback)
    }
  }, [webapp])

  const close = useCallback(() => {
    if (webapp) {
      webapp.close()
    }
  }, [webapp])

  const sendData = useCallback((data: string) => {
    if (webapp) {
      webapp.sendData(data)
    }
  }, [webapp])

  return {
    webapp,
    isReady,
    showAlert,
    showConfirm,
    close,
    sendData,
  }
}
