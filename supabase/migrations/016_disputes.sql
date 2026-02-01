-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  against_user UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' NOT NULL,
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disputes_shift_id ON disputes(shift_id);
CREATE INDEX IF NOT EXISTS idx_disputes_created_by ON disputes(created_by);
CREATE INDEX IF NOT EXISTS idx_disputes_against_user ON disputes(against_user);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view disputes they are involved in"
  ON disputes FOR SELECT
  USING (
    auth.uid() = created_by
    OR auth.uid() = against_user
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'shef')
    )
  );

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only admins can update disputes"
  ON disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'shef')
    )
  );

-- Add check constraints
ALTER TABLE disputes ADD CONSTRAINT check_dispute_reason
  CHECK (reason IN ('no_show', 'late', 'damage', 'quality', 'payment', 'other'));

ALTER TABLE disputes ADD CONSTRAINT check_dispute_status
  CHECK (status IN ('open', 'in_review', 'resolved', 'rejected'));

-- Function to get dispute statistics
CREATE OR REPLACE FUNCTION get_dispute_stats(user_uuid UUID)
RETURNS TABLE(
  total_disputes BIGINT,
  open_disputes BIGINT,
  resolved_disputes BIGINT,
  disputes_against BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE created_by = user_uuid OR against_user = user_uuid) as total_disputes,
    COUNT(*) FILTER (WHERE status = 'open' AND (created_by = user_uuid OR against_user = user_uuid)) as open_disputes,
    COUNT(*) FILTER (WHERE status = 'resolved' AND (created_by = user_uuid OR against_user = user_uuid)) as resolved_disputes,
    COUNT(*) FILTER (WHERE against_user = user_uuid) as disputes_against
  FROM disputes;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE disputes IS 'Stores disputes/arbitration cases between users';
