-- Admin notes table for tracking admin comments about users
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_admin_id ON admin_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can view notes
CREATE POLICY "Admins can view notes"
  ON admin_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can insert notes
CREATE POLICY "Admins can insert notes"
  ON admin_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
    AND admin_id = auth.uid()
  );

-- Only admins can delete notes
CREATE POLICY "Admins can delete notes"
  ON admin_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to get note count for a user
CREATE OR REPLACE FUNCTION get_user_notes_count(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM admin_notes
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent notes across all users
CREATE OR REPLACE FUNCTION get_recent_admin_notes(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  admin_id UUID,
  note TEXT,
  created_at TIMESTAMP,
  user_name TEXT,
  admin_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    an.id,
    an.user_id,
    an.admin_id,
    an.note,
    an.created_at,
    u.full_name as user_name,
    a.full_name as admin_name
  FROM admin_notes an
  LEFT JOIN users u ON u.id = an.user_id
  LEFT JOIN users a ON a.id = an.admin_id
  ORDER BY an.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
