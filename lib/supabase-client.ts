import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

/**
 * Create a Supabase client for use in client components
 * This function creates a new client instance each time it's called
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}
