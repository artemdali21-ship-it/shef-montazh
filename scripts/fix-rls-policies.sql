-- Fix RLS policy for worker_profiles to allow users to update their own profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_insert_worker_profile" ON worker_profiles;
DROP POLICY IF EXISTS "allow_select_own_worker_profile" ON worker_profiles;
DROP POLICY IF EXISTS "allow_update_own_worker_profile" ON worker_profiles;

-- Create new proper RLS policies for worker_profiles

-- Allow users to select their own profile
CREATE POLICY "allow_select_own_worker_profile" ON worker_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "allow_insert_own_worker_profile" ON worker_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "allow_update_own_worker_profile" ON worker_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Similar policies for client_profiles if they exist

-- Drop existing policies
DROP POLICY IF EXISTS "allow_insert_client_profile" ON client_profiles;
DROP POLICY IF EXISTS "allow_select_own_client_profile" ON client_profiles;
DROP POLICY IF EXISTS "allow_update_own_client_profile" ON client_profiles;

-- Create new proper RLS policies for client_profiles
CREATE POLICY "allow_select_own_client_profile" ON client_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "allow_insert_own_client_profile" ON client_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_update_own_client_profile" ON client_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
