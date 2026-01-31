-- Add role column to users table if it doesn't exist
-- This migration handles the mismatch between user_type and role

-- Check if role column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'role'
  ) THEN
    -- Add role column
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'client', 'shef'));

    -- If user_type column exists, copy data from it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'user_type'
    ) THEN
      UPDATE users SET role = user_type WHERE user_type IS NOT NULL;
      -- Optionally drop user_type column
      -- ALTER TABLE users DROP COLUMN user_type;
    END IF;

    -- Create index on role
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  END IF;
END $$;

-- Also add email column if it doesn't exist (registration needs it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
  END IF;
END $$;
