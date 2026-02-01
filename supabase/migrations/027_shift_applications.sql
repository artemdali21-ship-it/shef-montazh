-- Shift applications table
CREATE TABLE IF NOT EXISTS shift_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shift_id, worker_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shift_applications_shift_id ON shift_applications(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_worker_id ON shift_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_status ON shift_applications(status);

-- RLS Policies
ALTER TABLE shift_applications ENABLE ROW LEVEL SECURITY;

-- Workers can view their own applications
CREATE POLICY "Workers can view own applications"
  ON shift_applications FOR SELECT
  USING (auth.uid() = worker_id);

-- Workers can create applications
CREATE POLICY "Workers can create applications"
  ON shift_applications FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- Clients can view applications for their shifts
CREATE POLICY "Clients can view applications for their shifts"
  ON shift_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_applications.shift_id
      AND shifts.client_id = auth.uid()
    )
  );

-- Clients can update applications for their shifts
CREATE POLICY "Clients can update applications for their shifts"
  ON shift_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_applications.shift_id
      AND shifts.client_id = auth.uid()
    )
  );

-- Shefs can view applications for shifts with their teams
CREATE POLICY "Shefs can view team applications"
  ON shift_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.worker_id = shift_applications.worker_id
      AND tm.team_id IN (
        SELECT id FROM teams WHERE shef_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shift_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_shift_applications_updated_at
  BEFORE UPDATE ON shift_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_applications_updated_at();
