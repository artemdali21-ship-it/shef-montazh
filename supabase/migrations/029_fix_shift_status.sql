-- Fix RLS policies to use 'published' instead of 'open'
-- Also fix client creation policy to use user.id instead of client_profile.id
-- Fix is_shift_participant function to use user.id

-- Create helper functions if they don't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_worker_owner(worker_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM worker_profiles
    WHERE id = worker_profile_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix is_shift_participant function
DROP FUNCTION IF EXISTS is_shift_participant(UUID);

CREATE OR REPLACE FUNCTION is_shift_participant(shift_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- Владелец смены (client) - now uses user.id directly
    SELECT 1 FROM shifts s
    WHERE s.id = shift_id AND s.client_id = auth.uid()
  );
  -- Note: shift_assignments table doesn't exist yet, so we only check client ownership for now
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old policies
DROP POLICY IF EXISTS "Workers can view open shifts" ON shifts;
DROP POLICY IF EXISTS "Workers can apply to shifts" ON shift_applications;
DROP POLICY IF EXISTS "Clients can create shifts" ON shifts;

-- Recreate with correct status value
CREATE POLICY "Workers can view open shifts"
  ON shifts FOR SELECT
  USING (
    status = 'published'
    OR is_shift_participant(id)
    OR is_admin()
  );

CREATE POLICY "Workers can apply to shifts"
  ON shift_applications FOR INSERT
  WITH CHECK (
    is_worker_owner(worker_id)
    AND EXISTS (
      SELECT 1 FROM shifts
      WHERE id = shift_id AND status = 'published'
    )
  );

-- Fix client creation policy to check user.id = auth.uid() and has client_profile
CREATE POLICY "Clients can create shifts"
  ON shifts FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid()
    )
  );
