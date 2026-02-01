-- Audit logs table for tracking all actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System can insert audit logs (no RLS on insert)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Function to automatically create audit log for important events
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when user is banned/unbanned
  IF (TG_OP = 'UPDATE' AND OLD.is_banned IS DISTINCT FROM NEW.is_banned) THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NEW.id,
      CASE WHEN NEW.is_banned THEN 'user.banned' ELSE 'user.unbanned' END,
      'user',
      NEW.id,
      jsonb_build_object(
        'previous_state', OLD.is_banned,
        'new_state', NEW.is_banned
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user changes (optional - can also log manually)
-- CREATE TRIGGER user_changes_audit
--   AFTER UPDATE ON users
--   FOR EACH ROW
--   EXECUTE FUNCTION log_user_changes();

-- Helper function to get recent logs count
CREATE OR REPLACE FUNCTION get_recent_logs_count(hours INTEGER DEFAULT 24)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM audit_logs
    WHERE created_at > NOW() - (hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get logs by action type
CREATE OR REPLACE FUNCTION get_logs_by_action(action_filter VARCHAR)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE al.action LIKE action_filter || '%'
  ORDER BY al.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
