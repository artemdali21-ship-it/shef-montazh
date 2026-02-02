-- Missing Tables Migration
-- Creates all tables referenced in code but not yet created

-- 1. Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 2. Documents table (digital acts)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  signed_by UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_shift ON documents(shift_id);

-- 3. API Logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER,
  response_time INTEGER,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_logs(user_id);

-- 4. Audit Logs table (admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 5. Payment Cron Logs table
CREATE TABLE IF NOT EXISTS payment_cron_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  overdue_found INTEGER DEFAULT 0,
  clients_blocked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Update shifts table with completion fields
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS client_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS worker_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS worker_completed_at TIMESTAMP WITH TIME ZONE;

-- 7. Update shift_assignments with check-in fields
ALTER TABLE shift_assignments
ADD COLUMN IF NOT EXISTS check_in_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_photo_url TEXT;

-- RLS POLICIES

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_messages"
  ON messages FOR SELECT
  USING (auth.uid()::text = from_id::text OR auth.uid()::text = to_id::text);

CREATE POLICY "users_send_messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = from_id::text);

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = documents.shift_id
      AND (
        shifts.client_id::text = auth.uid()::text
        OR shifts.id IN (
          SELECT shift_id FROM shift_assignments
          WHERE worker_id::text = auth.uid()::text
        )
      )
    )
  );

-- API Logs (admin only)
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_api_logs"
  ON api_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Audit Logs (admin only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_audit_logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );

COMMENT ON TABLE messages IS 'One-on-one chat messages between users';
COMMENT ON TABLE documents IS 'Digital acts and completion documents';
COMMENT ON TABLE api_logs IS 'API request logging for monitoring';
COMMENT ON TABLE audit_logs IS 'Admin action audit trail';
