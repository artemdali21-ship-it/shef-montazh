-- Migration: Telegram CloudStorage Session System
-- This migration adds all necessary columns for Telegram-based authentication

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index on telegram_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Create index on session_token for session validation
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);

-- Update existing users to set has_completed_onboarding based on profile_completed
UPDATE users
SET has_completed_onboarding = profile_completed
WHERE has_completed_onboarding IS NULL;

-- RLS Policies for users table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Public can insert users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Allow public insert for registration (will be controlled by API)
CREATE POLICY "Public can insert users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- Add comment for documentation
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID for authentication';
COMMENT ON COLUMN users.has_completed_onboarding IS 'Whether user has completed onboarding screens';
COMMENT ON COLUMN users.last_login_at IS 'Last time user logged in';
COMMENT ON COLUMN users.session_token IS 'Session token for CloudStorage validation';
COMMENT ON COLUMN users.session_expires_at IS 'Session expiration timestamp';
