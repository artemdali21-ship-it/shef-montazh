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
  const supabase = await createClient()

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
 * Get messages between two users
 */
export async function getMessages(
  userId: string,
  partnerId: string,
  limit = 50
): Promise<{ data: Message[], error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Reverse to show oldest first
    return { data: (data || []).reverse(), error: null }
  } catch (error) {
    console.error('Error fetching messages:', error)
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
  const supabase = await createClient()

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
  const supabase = await createClient()

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

/**
 * Upload a chat image to Supabase Storage
 */
export async function uploadChatImage(file: File, userId: string): Promise<{ url: string | null, error: any }> {
  const supabase = await createClient()

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `chat/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading chat image:', error)
    return { url: null, error }
  }
}

/**
 * Subscribe to new messages in real-time
 */
export async function subscribeToMessages(
  userId: string,
  partnerId: string,
  callback: (message: Message) => void
) {
  const supabase = await createClient()

  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(from_user_id.eq.${userId},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${userId}))`
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return channel
}
