import { createClient } from '@/lib/supabase-client'
import { removeFromFavorites } from './favorites'

/**
 * Block a user
 */
export async function blockUser(userId: string, targetUserId: string, reason?: string) {
  const supabase = await createClient()

  try {
    // First, remove from favorites if exists
    await removeFromFavorites(userId, targetUserId)

    // Then add to blocked
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        user_id: userId,
        blocked_user_id: targetUserId,
        reason: reason || null,
      })

    if (error) throw error

    return { success: true, error: null }
  } catch (err) {
    console.error('Error blocking user:', err)
    return { success: false, error: err as Error }
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string, targetUserId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', targetUserId)

    if (error) throw error

    return { success: true, error: null }
  } catch (err) {
    console.error('Error unblocking user:', err)
    return { success: false, error: err as Error }
  }
}

/**
 * Get list of blocked users with their details
 */
export async function getBlockedUsers(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select(`
        id,
        reason,
        created_at,
        blocked_user:users!blocked_users_blocked_user_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting blocked users:', err)
    return { data: [], error: err as Error }
  }
}

/**
 * Check if user is blocked
 */
export async function isBlocked(userId: string, targetUserId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('user_id', userId)
      .eq('blocked_user_id', targetUserId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

    return !!data
  } catch (err) {
    console.error('Error checking blocked:', err)
    return false
  }
}

/**
 * Check if mutual block exists (either user blocked the other)
 */
export async function isMutuallyBlocked(userId: string, targetUserId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`and(user_id.eq.${userId},blocked_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},blocked_user_id.eq.${userId})`)
      .limit(1)

    if (error) throw error

    return (data?.length || 0) > 0
  } catch (err) {
    console.error('Error checking mutual block:', err)
    return false
  }
}

/**
 * Get blocked user IDs (for filtering)
 */
export async function getBlockedIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', userId)

    if (error) throw error

    return (data || []).map(b => b.blocked_user_id).filter(Boolean) as string[]
  } catch (err) {
    console.error('Error getting blocked IDs:', err)
    return []
  }
}
