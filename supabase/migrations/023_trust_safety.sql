-- ============================================================================
-- Trust & Safety System
-- ============================================================================
--
-- Система репутации и антифрода для защиты участников маркетплейса
--
-- ============================================================================

-- Trust Events - журнал событий влияющих на репутацию
CREATE TABLE IF NOT EXISTS trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  impact INTEGER NOT NULL, -- Изменение trust_score (-30, +5, etc)
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trust_events_user_id ON trust_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_event_type ON trust_events(event_type);
CREATE INDEX IF NOT EXISTS idx_trust_events_created_at ON trust_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trust_events_shift_id ON trust_events(shift_id) WHERE shift_id IS NOT NULL;

-- Add trust_score to profiles
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100);

-- Add suspicious flags
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;

-- Add blocked status
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add phone verification
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Add company INN for clients
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS company_inn VARCHAR(12);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS inn_verified BOOLEAN DEFAULT false;

-- Add payment method verification
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS payment_method_verified BOOLEAN DEFAULT false;

-- ============================================================================
-- Trust Score Event Types
-- ============================================================================

-- Negative events (Client)
-- - 'unpaid_shift': -30 (не оплатил смену)
-- - 'late_payment': -10 (опоздал с оплатой >24h)
-- - 'late_cancellation': -10 to -30 (отменил смену <24h)
-- - 'dispute_lost': -20 (проиграл спор)
-- - 'spam_content': -15 (спам в описании смены)

-- Positive events (Client)
-- - 'paid_on_time': +5 (оплатил вовремя)
-- - 'completed_shift': +2 (завершил смену)
-- - 'inn_verified': +20 (подтвердил ИНН)

-- Negative events (Worker)
-- - 'no_show': -20 (не пришел на смену)
-- - 'late_arrival': -5 (опоздал >30 мин)
-- - 'early_leave': -10 (ушел раньше без согласия)
-- - 'dispute_lost': -15 (проиграл спор)
-- - 'spam_messages': -10 (спам в сообщениях)

-- Positive events (Worker)
-- - 'completed_shift': +2 (завершил смену)
-- - 'positive_rating': +5 (получил 5 звезд)
-- - 'passport_verified': +10 (подтвердил паспорт)

-- ============================================================================
-- Functions
-- ============================================================================

-- Создать trust event и обновить trust_score
CREATE OR REPLACE FUNCTION create_trust_event(
  p_user_id UUID,
  p_event_type VARCHAR,
  p_severity VARCHAR,
  p_impact INTEGER,
  p_shift_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_role VARCHAR;
  v_new_score INTEGER;
BEGIN
  -- Создаём событие
  INSERT INTO trust_events (
    user_id, event_type, severity, impact, shift_id, description, metadata
  ) VALUES (
    p_user_id, p_event_type, p_severity, p_impact, p_shift_id, p_description, p_metadata
  ) RETURNING id INTO v_event_id;

  -- Определяем роль пользователя
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;

  -- Обновляем trust_score
  IF v_user_role = 'worker' THEN
    UPDATE worker_profiles
    SET trust_score = GREATEST(0, LEAST(100, trust_score + p_impact))
    WHERE user_id = p_user_id
    RETURNING trust_score INTO v_new_score;

    -- Автоматическая блокировка при trust_score < 30
    IF v_new_score < 30 THEN
      UPDATE worker_profiles
      SET is_blocked = true
      WHERE user_id = p_user_id;
    END IF;

  ELSIF v_user_role = 'client' THEN
    UPDATE client_profiles
    SET trust_score = GREATEST(0, LEAST(100, trust_score + p_impact))
    WHERE user_id = p_user_id
    RETURNING trust_score INTO v_new_score;

    -- Автоматическая блокировка при trust_score < 30
    IF v_new_score < 30 THEN
      UPDATE client_profiles
      SET is_blocked = true
      WHERE user_id = p_user_id;
    END IF;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Получить текущий trust_score пользователя
CREATE OR REPLACE FUNCTION get_trust_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
  v_role VARCHAR;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = p_user_id;

  IF v_role = 'worker' THEN
    SELECT trust_score INTO v_score FROM worker_profiles WHERE user_id = p_user_id;
  ELSIF v_role = 'client' THEN
    SELECT trust_score INTO v_score FROM client_profiles WHERE user_id = p_user_id;
  ELSE
    RETURN 100; -- Админы всегда 100
  END IF;

  RETURN COALESCE(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Проверка suspicious patterns
CREATE OR REPLACE FUNCTION check_suspicious_activity(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role VARCHAR;
  v_recent_events INTEGER;
  v_negative_events INTEGER;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = p_user_id;

  -- Считаем негативные события за последние 7 дней
  SELECT COUNT(*) INTO v_negative_events
  FROM trust_events
  WHERE user_id = p_user_id
    AND impact < 0
    AND created_at > NOW() - INTERVAL '7 days';

  -- Client: >3 негативных событий за неделю = suspicious
  IF v_role = 'client' AND v_negative_events >= 3 THEN
    UPDATE client_profiles SET is_suspicious = true WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  -- Worker: >2 негативных событий за неделю = suspicious
  IF v_role = 'worker' AND v_negative_events >= 2 THEN
    UPDATE worker_profiles SET is_suspicious = true WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Сброс suspicious флага (после проверки админом)
CREATE OR REPLACE FUNCTION clear_suspicious_flag(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_role VARCHAR;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = p_user_id;

  IF v_role = 'worker' THEN
    UPDATE worker_profiles SET is_suspicious = false WHERE user_id = p_user_id;
  ELSIF v_role = 'client' THEN
    UPDATE client_profiles SET is_suspicious = false WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Автоматическая проверка suspicious после каждого негативного события
CREATE OR REPLACE FUNCTION trigger_check_suspicious()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impact < 0 THEN
    PERFORM check_suspicious_activity(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_trust_event_check_suspicious
AFTER INSERT ON trust_events
FOR EACH ROW
EXECUTE FUNCTION trigger_check_suspicious();

-- ============================================================================
-- Views
-- ============================================================================

-- View: Suspicious users (для админки)
CREATE OR REPLACE VIEW suspicious_users AS
SELECT
  u.id,
  u.email,
  u.phone,
  u.role,
  CASE
    WHEN u.role = 'worker' THEN wp.trust_score
    WHEN u.role = 'client' THEN cp.trust_score
  END as trust_score,
  CASE
    WHEN u.role = 'worker' THEN wp.is_suspicious
    WHEN u.role = 'client' THEN cp.is_suspicious
  END as is_suspicious,
  (
    SELECT COUNT(*) FROM trust_events te
    WHERE te.user_id = u.id AND te.impact < 0 AND te.created_at > NOW() - INTERVAL '7 days'
  ) as negative_events_last_week
FROM users u
LEFT JOIN worker_profiles wp ON wp.user_id = u.id
LEFT JOIN client_profiles cp ON cp.user_id = u.id
WHERE
  (wp.is_suspicious = true OR cp.is_suspicious = true)
  OR (wp.trust_score < 50 OR cp.trust_score < 50);

-- View: Trust score history
CREATE OR REPLACE VIEW trust_score_history AS
SELECT
  te.user_id,
  u.email,
  u.role,
  te.event_type,
  te.severity,
  te.impact,
  te.shift_id,
  te.description,
  te.created_at,
  -- Running total
  (
    SELECT SUM(te2.impact)
    FROM trust_events te2
    WHERE te2.user_id = te.user_id AND te2.created_at <= te.created_at
  ) + 100 as score_after_event
FROM trust_events te
JOIN users u ON u.id = te.user_id
ORDER BY te.created_at DESC;

-- ============================================================================
-- Sample Data
-- ============================================================================

-- Примеры использования:

-- 1. Client не оплатил смену
-- SELECT create_trust_event(
--   'client-id',
--   'unpaid_shift',
--   'high',
--   -30,
--   'shift-id',
--   'Client did not pay within 24 hours'
-- );

-- 2. Worker завершил смену успешно
-- SELECT create_trust_event(
--   'worker-id',
--   'completed_shift',
--   'low',
--   +2,
--   'shift-id',
--   'Successfully completed shift'
-- );

-- 3. Client оплатил вовремя
-- SELECT create_trust_event(
--   'client-id',
--   'paid_on_time',
--   'low',
--   +5,
--   'shift-id',
--   'Paid within 1 hour after completion'
-- );

-- ============================================================================
-- Admin Queries
-- ============================================================================

-- Получить suspicious пользователей
-- SELECT * FROM suspicious_users ORDER BY negative_events_last_week DESC;

-- Получить историю trust_score пользователя
-- SELECT * FROM trust_score_history WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- Получить всех заблокированных
-- SELECT u.id, u.email, u.role,
--   CASE WHEN u.role = 'worker' THEN wp.trust_score ELSE cp.trust_score END as trust_score
-- FROM users u
-- LEFT JOIN worker_profiles wp ON wp.user_id = u.id
-- LEFT JOIN client_profiles cp ON cp.user_id = u.id
-- WHERE wp.is_blocked = true OR cp.is_blocked = true;
