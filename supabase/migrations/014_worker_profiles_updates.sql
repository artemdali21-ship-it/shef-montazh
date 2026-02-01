-- Add status, ban, and verification columns to worker_profiles if they don't exist

-- Add status column (active, banned, etc.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='worker_profiles' AND column_name='status') THEN
    ALTER TABLE worker_profiles ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- Add ban_reason column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='worker_profiles' AND column_name='ban_reason') THEN
    ALTER TABLE worker_profiles ADD COLUMN ban_reason TEXT;
  END IF;
END $$;

-- Add ban_until column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='worker_profiles' AND column_name='ban_until') THEN
    ALTER TABLE worker_profiles ADD COLUMN ban_until TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add verification_status column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='worker_profiles' AND column_name='verification_status') THEN
    ALTER TABLE worker_profiles ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending';
  END IF;
END $$;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_worker_profiles_status ON worker_profiles(status);

-- Create index on categories for faster filtering
CREATE INDEX IF NOT EXISTS idx_worker_profiles_categories ON worker_profiles USING GIN(categories);

-- Comment on categories column for documentation
COMMENT ON COLUMN worker_profiles.categories IS 'Array of category IDs: montazhnik, dekorator, elektrik, svarshchik, alpinist, butafor, raznorabochiy';

-- Update RLS policies to allow admins to update any profile
CREATE POLICY "Admins can update any worker profile"
  ON worker_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'shef')
    )
  );
