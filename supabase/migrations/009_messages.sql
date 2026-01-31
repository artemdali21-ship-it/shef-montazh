-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(to_user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can mark their messages as read"
  ON messages FOR UPDATE
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- Create function to get user chats
CREATE OR REPLACE FUNCTION get_user_chats(user_id UUID)
RETURNS TABLE (
  partner_id UUID,
  partner_name TEXT,
  partner_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (partner.id)
    partner.id,
    partner.full_name,
    partner.avatar_url,
    m.content,
    m.created_at,
    (SELECT COUNT(*) FROM messages
     WHERE to_user_id = user_id
     AND from_user_id = partner.id
     AND is_read = false)::BIGINT
  FROM users partner
  JOIN messages m ON (
    (m.from_user_id = user_id AND m.to_user_id = partner.id) OR
    (m.to_user_id = user_id AND m.from_user_id = partner.id)
  )
  WHERE partner.id != user_id
  ORDER BY partner.id, m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
