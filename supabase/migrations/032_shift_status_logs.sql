-- Shift Status Logs Table
-- Логирование всех изменений статуса смены

CREATE TABLE IF NOT EXISTS shift_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shift_status_logs_shift ON shift_status_logs(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_status_logs_changed_at ON shift_status_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_status_logs_to_status ON shift_status_logs(to_status);

-- RLS Policies
ALTER TABLE shift_status_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for shifts they're involved in
CREATE POLICY "users_view_own_shift_logs"
  ON shift_status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_status_logs.shift_id
      AND (
        shifts.client_id::text = auth.uid()::text
        OR shifts.id IN (
          SELECT shift_id FROM shift_assignments
          WHERE worker_id::text = auth.uid()::text
        )
      )
    )
  );

-- Admins can view all logs
CREATE POLICY "admins_view_all_logs"
  ON shift_status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Only system can insert logs (через service role key)
-- No user-facing insert policy

COMMENT ON TABLE shift_status_logs IS 'Audit log of all shift status changes';
COMMENT ON COLUMN shift_status_logs.from_status IS 'Previous status';
COMMENT ON COLUMN shift_status_logs.to_status IS 'New status';
COMMENT ON COLUMN shift_status_logs.reason IS 'Optional reason for status change';
COMMENT ON COLUMN shift_status_logs.metadata IS 'Additional context (e.g., who triggered, IP, etc.)';
