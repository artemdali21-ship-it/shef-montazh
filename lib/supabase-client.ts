import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'
import { telegramStorage } from './telegram-storage'

/**
 * Create a Supabase client for use in client components
 * This function creates a new client instance each time it's called
 * with proper session persistence using Telegram CloudStorage
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: telegramStorage,
      storageKey: 'shef-montazh-auth',
    },
  })
}
