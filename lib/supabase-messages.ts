import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get all chats for current user
export async function getUserChats(userId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  return { data, error }
}

// Get messages for a chat
export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  return { data, error }
}

// Send a message
export async function sendMessage(chatId: string, senderId: string, text: string, messageType: string = 'text') {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      text: text,
      message_type: messageType,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)

  return { data, error }
}

// Create or get chat between two users
export async function getOrCreateChat(participant1: string, participant2: string) {
  // First, try to find existing chat
  const { data: existingChat } = await supabase
    .from('chats')
    .select('*')
    .or(
      `and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`
    )
    .single()

  if (existingChat) {
    return { data: existingChat, error: null }
  }

  // Create new chat
  const { data, error } = await supabase
    .from('chats')
    .insert({
      participant_1: participant1,
      participant_2: participant2,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

// Subscribe to new messages in real-time
export function subscribeToMessages(chatId: string, callback: (message: any) => void) {
  const subscription = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return subscription
}

// Subscribe to chat updates (new messages, typing indicators)
export function subscribeToChat(chatId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}
