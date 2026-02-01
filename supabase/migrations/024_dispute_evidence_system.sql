-- ============================================================================
-- Dispute Evidence System + SLA
-- ============================================================================
--
-- Проблема: Споры висят бесконечно, нет процесса доказательств,
-- непонятно что замораживается
--
-- Решение: Структурированная система доказательств + жесткие дедлайны
--
-- ============================================================================

-- Расширяем таблицу disputes
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS evidence_submitted_by_client BOOLEAN DEFAULT false;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS evidence_submitted_by_worker BOOLEAN DEFAULT false;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS frozen_assets JSONB DEFAULT '{}'::jsonb;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS assigned_admin UUID REFERENCES users(id);
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Таблица доказательств
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id),
  evidence_type VARCHAR(50) NOT NULL, -- 'photo' | 'geo_log' | 'chat_log' | 'document' | 'witness'
  file_url TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_submitted_by ON dispute_evidence(submitted_by);
CREATE INDEX IF NOT EXISTS idx_disputes_sla_deadline ON disputes(sla_deadline) WHERE status IN ('open', 'under_review');
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_admin ON disputes(assigned_admin);

-- Таблица SLA нарушений
CREATE TABLE IF NOT EXISTS dispute_sla_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id),
  violation_type VARCHAR(50) NOT NULL, -- 'missed_evidence_deadline' | 'missed_admin_deadline' | 'no_response'
  expected_at TIMESTAMP NOT NULL,
  actual_at TIMESTAMP,
  responsible_party VARCHAR(20) NOT NULL, -- 'client' | 'worker' | 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SLA Rules (Service Level Agreement)
-- ============================================================================

-- Дедлайны:
-- 1. Client/Worker должны предоставить доказательства в течение 48 часов
-- 2. Admin должен вынести решение в течение 24 часов после получения всех доказательств
-- 3. Если одна из сторон не предоставила доказательства → автоматическое решение против нее

-- ============================================================================
-- Functions
-- ============================================================================

-- Создать спор с автоматическим SLA
CREATE OR REPLACE FUNCTION create_dispute_with_sla(
  p_shift_id UUID,
  p_raised_by UUID,
  p_reason TEXT,
  p_priority VARCHAR DEFAULT 'normal'
) RETURNS UUID AS $$
DECLARE
  v_dispute_id UUID;
  v_evidence_deadline TIMESTAMP;
  v_shift_amount DECIMAL;
BEGIN
  -- Дедлайн на предоставление доказательств: 48 часов
  v_evidence_deadline := NOW() + INTERVAL '48 hours';

  -- Получаем сумму смены (для приоритета)
  SELECT total_amount INTO v_shift_amount FROM shifts WHERE id = p_shift_id;

  -- Автоматический приоритет для больших сумм
  IF v_shift_amount > 50000 THEN
    p_priority := 'high';
  ELSIF v_shift_amount > 100000 THEN
    p_priority := 'urgent';
  END IF;

  -- Создаем спор
  INSERT INTO disputes (
    shift_id,
    raised_by,
    reason,
    status,
    sla_deadline,
    priority,
    frozen_assets,
    created_at
  ) VALUES (
    p_shift_id,
    p_raised_by,
    p_reason,
    'open',
    v_evidence_deadline,
    p_priority,
    jsonb_build_object(
      'payment_frozen', true,
      'payout_frozen', true,
      'rating_frozen', true
    ),
    NOW()
  ) RETURNING id INTO v_dispute_id;

  -- Уведомляем обе стороны
  -- TODO: Send notifications

  RETURN v_dispute_id;
END;
$$ LANGUAGE plpgsql;

-- Отправить доказательство
CREATE OR REPLACE FUNCTION submit_dispute_evidence(
  p_dispute_id UUID,
  p_submitted_by UUID,
  p_evidence_type VARCHAR,
  p_file_url TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_evidence_id UUID;
  v_role VARCHAR;
BEGIN
  -- Проверяем что спор еще открыт
  IF NOT EXISTS (
    SELECT 1 FROM disputes
    WHERE id = p_dispute_id AND status IN ('open', 'under_review')
  ) THEN
    RAISE EXCEPTION 'Dispute is closed or does not exist';
  END IF;

  -- Создаем доказательство
  INSERT INTO dispute_evidence (
    dispute_id,
    submitted_by,
    evidence_type,
    file_url,
    description,
    metadata
  ) VALUES (
    p_dispute_id,
    p_submitted_by,
    p_evidence_type,
    p_file_url,
    p_description,
    p_metadata
  ) RETURNING id INTO v_evidence_id;

  -- Определяем роль отправителя
  SELECT role INTO v_role FROM users WHERE id = p_submitted_by;

  -- Отмечаем что сторона предоставила доказательства
  IF v_role = 'client' THEN
    UPDATE disputes
    SET evidence_submitted_by_client = true
    WHERE id = p_dispute_id;
  ELSIF v_role = 'worker' THEN
    UPDATE disputes
    SET evidence_submitted_by_worker = true
    WHERE id = p_dispute_id;
  END IF;

  -- Если обе стороны предоставили доказательства → переводим в under_review
  UPDATE disputes
  SET
    status = 'under_review',
    sla_deadline = NOW() + INTERVAL '24 hours' -- Дедлайн для админа
  WHERE id = p_dispute_id
    AND evidence_submitted_by_client = true
    AND evidence_submitted_by_worker = true
    AND status = 'open';

  RETURN v_evidence_id;
END;
$$ LANGUAGE plpgsql;

-- Проверить просроченные SLA
CREATE OR REPLACE FUNCTION check_dispute_sla_violations()
RETURNS VOID AS $$
DECLARE
  v_dispute RECORD;
BEGIN
  -- Ищем споры с просроченным дедлайном
  FOR v_dispute IN
    SELECT * FROM disputes
    WHERE sla_deadline < NOW()
      AND status IN ('open', 'under_review')
  LOOP
    IF v_dispute.status = 'open' THEN
      -- Дедлайн на доказательства истек
      -- Проверяем кто не предоставил
      IF NOT v_dispute.evidence_submitted_by_client THEN
        -- Client не предоставил → автоматически в пользу worker
        PERFORM resolve_dispute_auto(
          v_dispute.id,
          'worker',
          'Client did not provide evidence within 48 hours'
        );

        INSERT INTO dispute_sla_violations (
          dispute_id,
          violation_type,
          expected_at,
          actual_at,
          responsible_party
        ) VALUES (
          v_dispute.id,
          'missed_evidence_deadline',
          v_dispute.sla_deadline,
          NOW(),
          'client'
        );
      ELSIF NOT v_dispute.evidence_submitted_by_worker THEN
        -- Worker не предоставил → автоматически в пользу client
        PERFORM resolve_dispute_auto(
          v_dispute.id,
          'client',
          'Worker did not provide evidence within 48 hours'
        );

        INSERT INTO dispute_sla_violations (
          dispute_id,
          violation_type,
          expected_at,
          actual_at,
          responsible_party
        ) VALUES (
          v_dispute.id,
          'missed_evidence_deadline',
          v_dispute.sla_deadline,
          NOW(),
          'worker'
        );
      END IF;
    ELSIF v_dispute.status = 'under_review' THEN
      -- Дедлайн админа истек → эскалация
      -- Уведомляем старшего админа
      INSERT INTO dispute_sla_violations (
        dispute_id,
        violation_type,
        expected_at,
        actual_at,
        responsible_party
      ) VALUES (
        v_dispute.id,
        'missed_admin_deadline',
        v_dispute.sla_deadline,
        NOW(),
        'admin'
      );

      -- Повышаем приоритет
      UPDATE disputes
      SET priority = 'urgent'
      WHERE id = v_dispute.id;

      -- TODO: Notify senior admin
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Автоматическое решение спора
CREATE OR REPLACE FUNCTION resolve_dispute_auto(
  p_dispute_id UUID,
  p_in_favor_of VARCHAR, -- 'client' | 'worker'
  p_reason TEXT
) RETURNS VOID AS $$
DECLARE
  v_shift_id UUID;
BEGIN
  -- Получаем shift_id
  SELECT shift_id INTO v_shift_id FROM disputes WHERE id = p_dispute_id;

  -- Резолвим спор
  UPDATE disputes
  SET
    status = 'resolved',
    resolution = jsonb_build_object(
      'in_favor_of', p_in_favor_of,
      'reason', p_reason,
      'auto_resolved', true,
      'resolved_at', NOW()
    ),
    resolved_at = NOW()
  WHERE id = p_dispute_id;

  -- Применяем последствия (payment/payout)
  -- TODO: Call payment resolution logic

  -- Разморозить активы
  -- TODO: Unfreeze payment/payout/rating
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views
-- ============================================================================

-- View: Споры требующие внимания админа
CREATE OR REPLACE VIEW disputes_requiring_attention AS
SELECT
  d.id,
  d.shift_id,
  s.title as shift_title,
  d.raised_by,
  d.reason,
  d.status,
  d.priority,
  d.sla_deadline,
  d.evidence_submitted_by_client,
  d.evidence_submitted_by_worker,
  (
    SELECT COUNT(*) FROM dispute_evidence de WHERE de.dispute_id = d.id
  ) as evidence_count,
  CASE
    WHEN d.sla_deadline < NOW() THEN true
    ELSE false
  END as sla_violated,
  d.assigned_admin,
  d.created_at
FROM disputes d
JOIN shifts s ON s.id = d.shift_id
WHERE d.status IN ('open', 'under_review')
ORDER BY
  CASE d.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  d.sla_deadline ASC;

-- ============================================================================
-- Sample Data / Usage
-- ============================================================================

-- 1. Создать спор
-- SELECT create_dispute_with_sla(
--   'shift-id',
--   'user-id',
--   'Worker did not complete the job properly'
-- );

-- 2. Отправить доказательство (фото)
-- SELECT submit_dispute_evidence(
--   'dispute-id',
--   'client-id',
--   'photo',
--   'https://storage/photo.jpg',
--   'Photo of incomplete work'
-- );

-- 3. Отправить доказательство (гео-лог)
-- SELECT submit_dispute_evidence(
--   'dispute-id',
--   'worker-id',
--   'geo_log',
--   NULL,
--   'I was on site from 9am to 5pm',
--   '{"check_in": "2024-01-01T09:00:00Z", "check_out": "2024-01-01T17:00:00Z"}'::jsonb
-- );

-- 4. Проверить SLA (cron job каждый час)
-- SELECT check_dispute_sla_violations();

-- 5. Получить споры требующие внимания
-- SELECT * FROM disputes_requiring_attention;
