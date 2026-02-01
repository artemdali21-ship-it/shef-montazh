-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user_id ON blocked_dates(user_id);

-- Create index on date range for faster filtering
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON blocked_dates(start_date, end_date);

-- Enable RLS
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own blocked dates"
  ON blocked_dates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blocked dates"
  ON blocked_dates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blocked dates"
  ON blocked_dates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blocked dates"
  ON blocked_dates FOR DELETE
  USING (auth.uid() = user_id);

-- Function to check if date is blocked
CREATE OR REPLACE FUNCTION is_date_blocked(
  check_user_id UUID,
  check_date DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_dates
    WHERE user_id = check_user_id
    AND check_date BETWEEN start_date AND end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE blocked_dates IS 'Stores date ranges when workers are unavailable';
