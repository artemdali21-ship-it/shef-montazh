-- ============================================================
-- МИГРАЦИЯ: Добавление enum типов для статусов
-- ============================================================
-- ⚠️ ВНИМАНИЕ: Запускать ТОЛЬКО после создания бэкапа БД!
-- ⚠️ Эта миграция изменяет типы данных в существующих таблицах
-- ============================================================

-- Шаг 1: Создать новые enum типы
-- ============================================================

-- Статусы смен
CREATE TYPE shift_status AS ENUM (
  'draft',           -- черновик
  'published',       -- опубликовано
  'applications',    -- есть отклики
  'shortlist',       -- шортлист
  'offer_sent',      -- приглашение отправлено
  'accepted',        -- принято
  'check_in',        -- идёт выход
  'in_progress',     -- в работе
  'completed',       -- завершено
  'payout',          -- оплачено
  'review',          -- оценено
  'cancelled'        -- отменено
);

-- Статусы откликов
CREATE TYPE application_status AS ENUM (
  'pending',         -- ожидает
  'shortlisted',     -- в шортлисте
  'invited',         -- приглашён
  'accepted',        -- принял
  'declined',        -- отклонён
  'cancelled'        -- отменён
);

-- Статусы работников
CREATE TYPE worker_status AS ENUM (
  'assigned',        -- назначен
  'on_way',          -- в пути
  'checked_in',      -- на месте
  'completed'        -- завершил
);

-- Шаг 2: Обновить таблицу shifts
-- ============================================================

-- Маппинг старых статусов на новые
ALTER TABLE shifts
ALTER COLUMN status TYPE shift_status
USING (
  CASE status
    WHEN 'open' THEN 'published'::shift_status
    WHEN 'in_progress' THEN 'in_progress'::shift_status
    WHEN 'completed' THEN 'completed'::shift_status
    WHEN 'cancelled' THEN 'cancelled'::shift_status
    ELSE 'draft'::shift_status
  END
);

-- Установить дефолтный статус
ALTER TABLE shifts
ALTER COLUMN status SET DEFAULT 'draft'::shift_status;

-- Шаг 3: Обновить таблицу applications
-- ============================================================

-- Маппинг старых статусов на новые
ALTER TABLE applications
ALTER COLUMN status TYPE application_status
USING (
  CASE status
    WHEN 'pending' THEN 'pending'::application_status
    WHEN 'accepted' THEN 'accepted'::application_status
    WHEN 'rejected' THEN 'declined'::application_status
    WHEN 'cancelled' THEN 'cancelled'::application_status
    ELSE 'pending'::application_status
  END
);

-- Установить дефолтный статус
ALTER TABLE applications
ALTER COLUMN status SET DEFAULT 'pending'::application_status;

-- Шаг 4: Обновить таблицу shift_workers
-- ============================================================

-- Добавить колонку worker_status (если её ещё нет)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shift_workers'
    AND column_name = 'worker_status'
  ) THEN
    ALTER TABLE shift_workers
    ADD COLUMN worker_status worker_status DEFAULT 'assigned'::worker_status;
  END IF;
END $$;

-- Обновить существующие записи на основе старого status (если есть)
UPDATE shift_workers
SET worker_status = CASE
  WHEN status = 'accepted' THEN 'assigned'::worker_status
  WHEN status = 'on_way' THEN 'on_way'::worker_status
  WHEN status = 'checked_in' THEN 'checked_in'::worker_status
  WHEN status = 'completed' THEN 'completed'::worker_status
  ELSE 'assigned'::worker_status
END
WHERE worker_status IS NULL;

-- Шаг 5: Создать индексы для оптимизации (опционально)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_shift_workers_status ON shift_workers(worker_status);

-- Шаг 6: Добавить триггер для автообновления updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создать триггер для shifts (если ещё нет)
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ПРОВЕРКА ПОСЛЕ МИГРАЦИИ
-- ============================================================

-- Проверить количество записей в каждом статусе
SELECT
  'shifts' as table_name,
  status::text,
  COUNT(*) as count
FROM shifts
GROUP BY status

UNION ALL

SELECT
  'applications' as table_name,
  status::text,
  COUNT(*) as count
FROM applications
GROUP BY status

UNION ALL

SELECT
  'shift_workers' as table_name,
  worker_status::text,
  COUNT(*) as count
FROM shift_workers
GROUP BY worker_status;

-- ============================================================
-- ОТКАТ МИГРАЦИИ (если что-то пошло не так)
-- ============================================================

-- ⚠️ ИСПОЛЬЗОВАТЬ ТОЛЬКО В КРАЙНЕМ СЛУЧАЕ!
-- ⚠️ Это удалит все новые статусы и вернёт старые типы

/*
-- Вернуть shifts к старому типу
ALTER TABLE shifts
ALTER COLUMN status TYPE VARCHAR(50)
USING (
  CASE status::text
    WHEN 'published' THEN 'open'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'completed' THEN 'completed'
    WHEN 'cancelled' THEN 'cancelled'
    ELSE 'open'
  END
);

-- Вернуть applications к старому типу
ALTER TABLE applications
ALTER COLUMN status TYPE VARCHAR(50)
USING (
  CASE status::text
    WHEN 'pending' THEN 'pending'
    WHEN 'accepted' THEN 'accepted'
    WHEN 'declined' THEN 'rejected'
    ELSE 'pending'
  END
);

-- Удалить worker_status из shift_workers
ALTER TABLE shift_workers DROP COLUMN IF EXISTS worker_status;

-- Удалить enum типы
DROP TYPE IF EXISTS shift_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS worker_status CASCADE;
*/
