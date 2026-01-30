import { supabase } from '../supabase'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participant_ids: string[]
  last_message?: string
  last_message_at?: string
  unread_count?: number
  created_at: string
}

// Get all conversations for a user
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages:messages(
        content,
        created_at,
        is_read,
        sender_id
      )
    `)
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false })

  return { data, error }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return { data, error }
}

// Send a message
export async function sendMessage(data: {
  conversation_id: string
  sender_id: string
  content: string
}) {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      ...data,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  // Update conversation's last message timestamp
  if (!error) {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.conversation_id)
  }

  return { data: message, error }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  return { error }
}

// Get or create conversation
export async function getOrCreateConversation(user1Id: string, user2Id: string) {
  // Try to find existing conversation
  const { data: existing, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [user1Id])
    .contains('participant_ids', [user2Id])
    .single()

  if (existing) {
    return { data: existing, error: null }
  }

  // Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      participant_ids: [user1Id, user2Id],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data: newConversation, error: createError }
}

// Subscribe to new messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()
}
