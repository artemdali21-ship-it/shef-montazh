-- User Preferences Table (для настроек уведомлений)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  notification_settings JSONB DEFAULT jsonb_build_object(
    'new_shift', true,
    'shift_accepted', true,
    'shift_rejected', true,
    'shift_starts_soon', true,
    'shift_completed', true,
    'payment_received', true,
    'payment_required', true,
    'payment_overdue', true,
    'worker_checked_in', true,
    'worker_no_show', true,
    'worker_late', true,
    'rating_updated', true,
    'user_blocked', true,
    'new_message', true,
    'team_assigned', true
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY "users_own_preferences"
  ON user_preferences FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Admins can view all preferences
CREATE POLICY "admins_view_all_preferences"
  ON user_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Create default preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_preferences WHERE user_preferences.user_id = users.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_preferences IS 'User notification preferences and settings';
COMMENT ON COLUMN user_preferences.notification_settings IS 'JSONB object with notification type toggles';
