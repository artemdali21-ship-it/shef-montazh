-- Team messages table for group chat
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_messages_team_id ON team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_id ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(team_id, created_at);

-- RLS Policies
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Team members can view messages
CREATE POLICY "Team members can view messages"
  ON team_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_messages.team_id
      AND team_members.worker_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_messages.team_id
      AND teams.shef_id = auth.uid()
    )
  );

-- Team members can send messages
CREATE POLICY "Team members can send messages"
  ON team_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_messages.team_id
        AND team_members.worker_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_messages.team_id
        AND teams.shef_id = auth.uid()
      )
    )
  );

-- Only sender can delete own messages
CREATE POLICY "Users can delete own messages"
  ON team_messages FOR DELETE
  USING (sender_id = auth.uid());

-- Function to get unread message count for team
CREATE OR REPLACE FUNCTION get_team_unread_count(user_uuid UUID, team_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  last_read TIMESTAMP;
  unread_count BIGINT;
BEGIN
  -- Get last read timestamp from user metadata or settings
  -- For now, return count of messages from last 24 hours
  SELECT COUNT(*)
  INTO unread_count
  FROM team_messages
  WHERE team_id = team_uuid
  AND sender_id != user_uuid
  AND created_at > NOW() - INTERVAL '24 hours';

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
