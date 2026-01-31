-- Create worker_profiles table if not exists
CREATE TABLE IF NOT EXISTS worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  categories TEXT[],
  experience_years INTEGER DEFAULT 0,
  district TEXT,
  tools_available TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles(user_id);

-- Enable RLS
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all worker profiles"
  ON worker_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own worker profile"
  ON worker_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own worker profile"
  ON worker_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own worker profile"
  ON worker_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_worker_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_worker_profiles_updated_at ON worker_profiles;
CREATE TRIGGER trigger_update_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_profiles_updated_at();
