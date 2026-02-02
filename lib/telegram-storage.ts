/**
 * Telegram CloudStorage adapter for Supabase
 * Uses Telegram's persistent storage instead of localStorage
 *
 * This adapter provides a synchronous interface required by Supabase
 * while using async Telegram CloudStorage in the background
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
 * Memory cache to provide synchronous access
 */
const memoryCache = new Map<string, string>()

/**
 * Initialize cache from localStorage on startup
 */
if (typeof window !== 'undefined') {
  try {
    const storageKeys = Object.keys(localStorage)
    storageKeys.forEach(key => {
      if (key.startsWith('shef-montazh')) {
        const value = localStorage.getItem(key)
        if (value) {
          memoryCache.set(key, value)
        }
      }
    })
    console.log('[TelegramStorage] Initialized cache with', memoryCache.size, 'items')
  } catch (e) {
    console.error('[TelegramStorage] Cache initialization error:', e)
  }
}

/**
 * Custom storage adapter that uses Telegram CloudStorage with synchronous interface
 */
export const telegramStorage = {
  getItem: (key: string): string | null => {
    console.log('[TelegramStorage] getItem called for key:', key)

    // Return from memory cache immediately
    const cachedValue = memoryCache.get(key)
    if (cachedValue !== undefined) {
      console.log('[TelegramStorage] Returning cached value')
      return cachedValue
    }

    // Try localStorage as fallback
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key)
      if (value) {
        memoryCache.set(key, value)
        console.log('[TelegramStorage] Found in localStorage, cached')
      }
      return value
    }

    return null
  },

  setItem: (key: string, value: string): void => {
    console.log('[TelegramStorage] setItem called for key:', key, 'value length:', value.length)

    // Update memory cache immediately
    memoryCache.set(key, value)

    // Update localStorage immediately (synchronous)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
      console.log('[TelegramStorage] ✅ localStorage setItem success')
    }

    // Update Telegram CloudStorage asynchronously (in background)
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
      console.log('[TelegramStorage] Updating Telegram CloudStorage in background')
      window.Telegram.WebApp.CloudStorage.setItem(key, value, (error, success) => {
        if (error || !success) {
          console.error('[TelegramStorage] CloudStorage setItem error:', error)
        } else {
          console.log('[TelegramStorage] ✅ CloudStorage setItem success')
        }
      })
    }
  },

  removeItem: (key: string): void => {
    console.log('[TelegramStorage] removeItem called for key:', key)

    // Remove from memory cache immediately
    memoryCache.delete(key)

    // Remove from localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }

    // Remove from Telegram CloudStorage asynchronously
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
      window.Telegram.WebApp.CloudStorage.removeItem(key, (error, success) => {
        if (error || !success) {
          console.error('[TelegramStorage] CloudStorage removeItem error:', error)
        }
      })
    }
  },
}
