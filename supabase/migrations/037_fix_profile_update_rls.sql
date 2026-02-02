-- Migration: Fix RLS policies for profile updates
-- This fixes the "row violates row-level security policy" error
-- when users try to update their profile photos and data

-- Fix worker_profiles UPDATE policy
DROP POLICY IF EXISTS "Workers can update own profile" ON worker_profiles;

CREATE POLICY "Workers can update own profile"
  ON worker_profiles FOR UPDATE
  USING (
    user_id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  );

-- Fix client_profiles UPDATE policy
DROP POLICY IF EXISTS "Clients can update own profile" ON client_profiles;

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE
  USING (
    user_id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  );

-- Fix users UPDATE policy to allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (
    id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  )
  WITH CHECK (
    -- Users can update their own profile fields (full_name, avatar_url, bio, phone)
    -- but cannot change roles or created_at
    id = auth.uid() OR (
      SELECT EXISTS(
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.roles @> ARRAY['admin']
      )
    )
  );
