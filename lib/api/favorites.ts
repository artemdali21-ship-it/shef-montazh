import { createClient } from '@/lib/supabase-client'

/**
 * Add user to favorites
 */
export async function addToFavorites(userId: string, targetUserId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        favorite_user_id: targetUserId,
      })

    if (error) throw error

    return { success: true, error: null }
  } catch (err) {
    console.error('Error adding to favorites:', err)
    return { success: false, error: err as Error }
  }
}

/**
 * Remove user from favorites
 */
export async function removeFromFavorites(userId: string, targetUserId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('favorite_user_id', targetUserId)

    if (error) throw error

    return { success: true, error: null }
  } catch (err) {
    console.error('Error removing from favorites:', err)
    return { success: false, error: err as Error }
  }
}

/**
 * Get list of favorite users with their details
 */
export async function getFavorites(userId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        favorite_user:users!favorites_favorite_user_id_fkey (
          id,
          full_name,
          avatar_url,
          rating,
          role,
          phone,
          is_verified,
          gosuslugi_verified,
          successful_shifts,
          total_shifts
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting favorites:', err)
    return { data: [], error: err as Error }
  }
}

/**
 * Check if user is in favorites
 */
export async function isFavorite(userId: string, targetUserId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_user_id', targetUserId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

    return !!data
  } catch (err) {
    console.error('Error checking favorite:', err)
    return false
  }
}

/**
 * Get favorite user IDs (for filtering)
 */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('favorite_user_id')
      .eq('user_id', userId)

    if (error) throw error

    return (data || []).map(f => f.favorite_user_id).filter(Boolean) as string[]
  } catch (err) {
    console.error('Error getting favorite IDs:', err)
    return []
  }
}
