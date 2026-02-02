/**
 * Telegram CloudStorage adapter for Supabase
 * Uses Telegram's persistent storage instead of localStorage
 */

interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: Error | null, success: boolean) => void): void
  getItem(key: string, callback: (error: Error | null, value: string | null) => void): void
  getItems(keys: string[], callback: (error: Error | null, values: Record<string, string>) => void): void
  removeItem(key: string, callback?: (error: Error | null, success: boolean) => void): void
  removeItems(keys: string[], callback?: (error: Error | null, success: boolean) => void): void
  getKeys(callback: (error: Error | null, keys: string[]) => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        CloudStorage?: TelegramCloudStorage
      }
    }
  }
}

/**
 * Custom storage adapter that uses Telegram CloudStorage with fallback to localStorage
 */
export const telegramStorage = {
  getItem: async (key: string): Promise<string | null> => {
    console.log('[TelegramStorage] getItem called for key:', key)

    // Try Telegram CloudStorage first
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
      console.log('[TelegramStorage] Using Telegram CloudStorage')
      return new Promise((resolve) => {
        window.Telegram!.WebApp!.CloudStorage!.getItem(key, (error, value) => {
          if (error) {
            console.error('[TelegramStorage] getItem error:', error)
            // Fallback to localStorage
            const fallbackValue = localStorage.getItem(key)
            console.log('[TelegramStorage] Fallback to localStorage, value:', fallbackValue ? 'exists' : 'null')
            resolve(fallbackValue)
          } else {
            console.log('[TelegramStorage] CloudStorage getItem success, value:', value ? 'exists' : 'null')
            resolve(value || null)
          }
        })
      })
    }

    // Fallback to localStorage
    console.log('[TelegramStorage] CloudStorage not available, using localStorage')
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key)
      console.log('[TelegramStorage] localStorage value:', value ? 'exists' : 'null')
      return value
    }

    return null
  },

  setItem: async (key: string, value: string): Promise<void> => {
    console.log('[TelegramStorage] setItem called for key:', key, 'value length:', value.length)

    // Try Telegram CloudStorage first
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
      console.log('[TelegramStorage] Using Telegram CloudStorage for setItem')
      return new Promise((resolve) => {
        window.Telegram!.WebApp!.CloudStorage!.setItem(key, value, (error, success) => {
          if (error || !success) {
            console.error('[TelegramStorage] setItem error:', error)
            // Fallback to localStorage
            localStorage.setItem(key, value)
            console.log('[TelegramStorage] Fallback to localStorage for setItem')
          } else {
            console.log('[TelegramStorage] ✅ CloudStorage setItem success')
          }
          resolve()
        })
      })
    }

    // Fallback to localStorage
    console.log('[TelegramStorage] CloudStorage not available, using localStorage for setItem')
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
      console.log('[TelegramStorage] ✅ localStorage setItem success')
    }
  },

  removeItem: async (key: string): Promise<void> => {
    console.log('[TelegramStorage] removeItem called for key:', key)

    // Try Telegram CloudStorage first
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram!.WebApp!.CloudStorage!.removeItem(key, (error, success) => {
          if (error || !success) {
            console.error('[TelegramStorage] removeItem error:', error)
            // Fallback to localStorage
            localStorage.removeItem(key)
          }
          resolve()
        })
      })
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
}
