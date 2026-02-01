-- Add 2FA columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled) WHERE two_factor_enabled = true;

-- Function to check if user has 2FA enabled
CREATE OR REPLACE FUNCTION user_has_2fa_enabled(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT two_factor_enabled
    FROM users
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get 2FA stats
CREATE OR REPLACE FUNCTION get_2fa_stats()
RETURNS TABLE (
  total_admins BIGINT,
  admins_with_2fa BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_admins,
    COUNT(*) FILTER (WHERE two_factor_enabled = true) as admins_with_2fa,
    ROUND(
      (COUNT(*) FILTER (WHERE two_factor_enabled = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as percentage
  FROM users
  WHERE role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
