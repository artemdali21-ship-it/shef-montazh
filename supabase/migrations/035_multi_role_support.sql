-- Migration: Multi-role support and profile completion tracking
-- Allows users to have multiple roles and switch between them

-- 1. Add new columns for multi-role support
ALTER TABLE users
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS current_role TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 2. Migrate existing single role data to roles array
UPDATE users
SET
  roles = ARRAY[role],
  current_role = role
WHERE roles = ARRAY[]::TEXT[] OR roles IS NULL;

-- 3. Add constraint to ensure roles array contains valid values
ALTER TABLE users
ADD CONSTRAINT valid_roles_check
CHECK (
  roles <@ ARRAY['worker', 'client', 'shef', 'admin']::TEXT[]
);

-- 4. Add constraint to ensure current_role is one of the user's roles
ALTER TABLE users
ADD CONSTRAINT current_role_in_roles_check
CHECK (
  current_role = ANY(roles) OR current_role IS NULL
);

-- 5. Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_users_current_role ON users(current_role);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- 6. Add comment for documentation
COMMENT ON COLUMN users.roles IS 'Array of roles assigned to user (e.g., [''worker'', ''client''])';
COMMENT ON COLUMN users.current_role IS 'Currently active role for this user session';
COMMENT ON COLUMN users.profile_completed IS 'Whether user has completed their profile (full name, phone, etc.)';

-- 7. Function to switch user role
CREATE OR REPLACE FUNCTION switch_user_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has this role
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND new_role = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'User does not have role: %', new_role;
  END IF;

  -- Update current_role
  UPDATE users
  SET current_role = new_role
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to add role to user
CREATE OR REPLACE FUNCTION add_user_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('worker', 'client', 'shef', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Add role if not already present
  UPDATE users
  SET roles = array_append(roles, new_role)
  WHERE id = user_id
  AND NOT (new_role = ANY(roles));

  -- Set as current_role if it's the first role
  UPDATE users
  SET current_role = new_role
  WHERE id = user_id
  AND current_role IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to remove role from user
CREATE OR REPLACE FUNCTION remove_user_role(user_id UUID, role_to_remove TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  remaining_roles TEXT[];
BEGIN
  -- Get remaining roles
  SELECT array_remove(roles, role_to_remove)
  INTO remaining_roles
  FROM users
  WHERE id = user_id;

  -- Ensure user has at least one role
  IF array_length(remaining_roles, 1) = 0 THEN
    RAISE EXCEPTION 'Cannot remove last role from user';
  END IF;

  -- Remove role
  UPDATE users
  SET roles = remaining_roles
  WHERE id = user_id;

  -- Update current_role if it was removed
  UPDATE users
  SET current_role = remaining_roles[1]
  WHERE id = user_id
  AND current_role = role_to_remove;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create RLS policy for role switching (users can switch their own roles)
CREATE POLICY "users_can_switch_own_role"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);
