-- Demo Mode Support
--
-- Добавляет поддержку демо-режима:
-- - is_demo флаг на users (для демо-пользователей)
-- - is_demo флаг на shifts (для демо-смен)
-- - Демо-пользователи могут смотреть но не могут создавать/изменять

-- Add is_demo flag to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add is_demo flag to shifts
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Index for demo users
CREATE INDEX IF NOT EXISTS idx_users_is_demo ON users(is_demo) WHERE is_demo = TRUE;

-- Index for demo shifts
CREATE INDEX IF NOT EXISTS idx_shifts_is_demo ON shifts(is_demo) WHERE is_demo = TRUE;

-- Function to check if user is demo
CREATE OR REPLACE FUNCTION is_demo_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND is_demo = TRUE
  );
END;
$$;

-- RLS: Demo users can read all demo data
CREATE POLICY "Demo users can read demo shifts"
ON shifts FOR SELECT
TO authenticated
USING (
  is_demo = TRUE
  OR client_id = auth.uid()
  OR id IN (
    SELECT shift_id FROM shift_applications WHERE worker_id = auth.uid()
  )
);

-- RLS: Demo users can read demo applications
CREATE POLICY "Demo users can read demo applications"
ON shift_applications FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM shifts WHERE id = shift_id AND is_demo = TRUE)
  OR worker_id = auth.uid()
  OR shift_id IN (SELECT id FROM shifts WHERE client_id = auth.uid())
);

-- RLS: Demo users CANNOT create/update/delete anything
-- (будет проверяться в API guards middleware)

COMMENT ON COLUMN users.is_demo IS 'Demo user flag - can view but not modify data';
COMMENT ON COLUMN shifts.is_demo IS 'Demo shift flag - visible to all authenticated users';
COMMENT ON FUNCTION is_demo_user IS 'Check if user is a demo user';
