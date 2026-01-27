// Утилиты для работы с Telegram Mini App

export const getTelegramApp = () => {
  if (typeof window !== 'undefined') {
    return (window as any).Telegram?.WebApp || null
  }
  return null
}

export const getTelegramUser = () => {
  const webapp = getTelegramApp()
  if (webapp && webapp.initDataUnsafe) {
    return webapp.initDataUnsafe.user
  }
  return null
}

export const getTelegramUserId = () => {
  const user = getTelegramUser()
  return user?.id || null
}

export const getInitData = () => {
  const webapp = getTelegramApp()
  return webapp?.initData || ''
}

export const getPlatform = () => {
  const webapp = getTelegramApp()
  return webapp?.platform || 'unknown'
}

export const getColorScheme = () => {
  const webapp = getTelegramApp()
  return webapp?.colorScheme || 'dark'
}

export const getThemeParams = () => {
  const webapp = getTelegramApp()
  return webapp?.themeParams || {}
}

export const getViewportHeight = () => {
  const webapp = getTelegramApp()
  return webapp?.viewportHeight || window.innerHeight
}

export const getViewportStableHeight = () => {
  const webapp = getTelegramApp()
  return webapp?.viewportStableHeight || window.innerHeight
}

export const formatTelegramInitData = (data: string): Record<string, string> => {
  const params = new URLSearchParams(data)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false
  return (window as any).Telegram?.WebApp !== undefined
}
