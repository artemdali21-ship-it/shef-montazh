import { createClient } from '@/lib/supabase-client'

export interface Chat {
  partner_id: string
  partner_name: string
  partner_avatar: string | null
  last_message: string
  last_message_time: string
  unread_count: number
}

export interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  content: string
  image_url: string | null
  is_read: boolean
  created_at: string
}

/**
 * Get list of all chats for a user
 */
export async function getChats(userId: string): Promise<{ data: Chat[], error: any }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_chats', { user_id: userId })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching chats:', error)
    return { data: [], error }
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  fromUserId: string,
  toUserId: string,
  content: string,
  imageUrl?: string
): Promise<{ data: Message | null, error: any }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        content,
        image_url: imageUrl || null,
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error sending message:', error)
    return { data: null, error }
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  userId: string,
  partnerId: string
): Promise<{ error: any }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('to_user_id', userId)
      .eq('from_user_id', partnerId)
      .eq('is_read', false)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return { error }
  }
}
