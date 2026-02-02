-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
--
-- Этот файл содержит ВСЕ RLS политики для защиты данных.
-- Без RLS любой пользователь может видеть/менять любые данные!
--
-- ============================================================================

-- Включаем RLS на всех таблицах
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Проверка, является ли пользователь админом
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

-- Проверка, является ли пользователь владельцем worker_profile
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

-- Проверка, является ли пользователь владельцем client_profile
CREATE OR REPLACE FUNCTION is_client_owner(client_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM client_profiles
    WHERE id = client_profile_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверка, является ли пользователь участником смены
CREATE OR REPLACE FUNCTION is_shift_participant(shift_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- Владелец смены (client)
    SELECT 1 FROM shifts s
    JOIN client_profiles cp ON s.client_id = cp.id
    WHERE s.id = shift_id AND cp.user_id = auth.uid()
  ) OR EXISTS (
    -- Assigned worker
    SELECT 1 FROM shift_assignments sa
    JOIN worker_profiles wp ON sa.worker_id = wp.id
    WHERE sa.shift_id = shift_id AND wp.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS
-- ============================================================================

-- SELECT: сам пользователь или admin
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- UPDATE: сам пользователь (свои данные) или admin
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (
    id = auth.uid() OR is_admin()
  )
  WITH CHECK (
    -- User может обновлять только свои данные
    id = auth.uid() OR is_admin()
  );

-- INSERT: при регистрации (через Supabase Auth)
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- DELETE: только admin
CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  USING (is_admin());

-- ============================================================================
-- WORKER_PROFILES
-- ============================================================================

-- SELECT: все видят публичные данные (для поиска)
CREATE POLICY "Anyone can view worker profiles"
  ON worker_profiles FOR SELECT
  USING (true);

-- INSERT: только при регистрации worker
CREATE POLICY "Workers can create own profile"
  ON worker_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: сам worker или admin
CREATE POLICY "Workers can update own profile"
  ON worker_profiles FOR UPDATE
  USING (
    user_id = auth.uid() OR is_admin()
  )
  WITH CHECK (
    -- Worker может менять любые свои данные
    user_id = auth.uid() OR is_admin()
  );

-- DELETE: только admin
CREATE POLICY "Only admins can delete worker profiles"
  ON worker_profiles FOR DELETE
  USING (is_admin());

-- ============================================================================
-- CLIENT_PROFILES
-- ============================================================================

-- SELECT: все видят публичные данные
CREATE POLICY "Anyone can view client profiles"
  ON client_profiles FOR SELECT
  USING (true);

-- INSERT: только при регистрации client
CREATE POLICY "Clients can create own profile"
  ON client_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: сам client или admin
CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE
  USING (
    user_id = auth.uid() OR is_admin()
  )
  WITH CHECK (
    -- Client может менять любые свои данные
    user_id = auth.uid() OR is_admin()
  );

-- DELETE: только admin
CREATE POLICY "Only admins can delete client profiles"
  ON client_profiles FOR DELETE
  USING (is_admin());

-- ============================================================================
-- SHIFTS
-- ============================================================================

-- SELECT:
-- - Открытые смены (status=published): все workers
-- - Свои смены: client (owner) или assigned workers
-- - Все: admin
CREATE POLICY "Workers can view open shifts"
  ON shifts FOR SELECT
  USING (
    status = 'published'
    OR is_shift_participant(id)
    OR is_admin()
  );

-- INSERT: только client
CREATE POLICY "Clients can create shifts"
  ON shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

-- UPDATE:
-- - client (owner) может менять до начала
-- - admin может всё
-- - worker может отметить check-in/out (через shift_assignments)
CREATE POLICY "Clients can update own shifts"
  ON shifts FOR UPDATE
  USING (
    is_client_owner(client_id)
    OR is_admin()
  )
  WITH CHECK (
    is_client_owner(client_id)
    OR is_admin()
  );

-- DELETE: только admin
CREATE POLICY "Only admins can delete shifts"
  ON shifts FOR DELETE
  USING (is_admin());

-- ============================================================================
-- SHIFT_APPLICATIONS
-- ============================================================================

-- SELECT: worker (автор), client (владелец смены), admin
CREATE POLICY "Participants can view applications"
  ON shift_applications FOR SELECT
  USING (
    is_worker_owner(worker_id)
    OR EXISTS (
      SELECT 1 FROM shifts s
      WHERE s.id = shift_id AND is_client_owner(s.client_id)
    )
    OR is_admin()
  );

-- INSERT: только worker (на открытую смену)
CREATE POLICY "Workers can apply to shifts"
  ON shift_applications FOR INSERT
  WITH CHECK (
    is_worker_owner(worker_id)
    AND EXISTS (
      SELECT 1 FROM shifts
      WHERE id = shift_id AND status = 'published'
    )
  );

-- UPDATE: worker может withdraw, client может accept/reject
CREATE POLICY "Workers and clients can update applications"
  ON shift_applications FOR UPDATE
  USING (
    is_worker_owner(worker_id)
    OR EXISTS (
      SELECT 1 FROM shifts s
      WHERE s.id = shift_id AND is_client_owner(s.client_id)
    )
    OR is_admin()
  );

-- DELETE: только admin
CREATE POLICY "Only admins can delete applications"
  ON shift_applications FOR DELETE
  USING (is_admin());

-- ============================================================================
-- SHIFT_ASSIGNMENTS
-- ============================================================================

-- SELECT: worker, client, admin
CREATE POLICY "Participants can view assignments"
  ON shift_assignments FOR SELECT
  USING (
    is_worker_owner(worker_id)
    OR EXISTS (
      SELECT 1 FROM shifts s
      WHERE s.id = shift_id AND is_client_owner(s.client_id)
    )
    OR is_admin()
  );

-- INSERT: только через accept application (контролируется API)
CREATE POLICY "System can create assignments"
  ON shift_assignments FOR INSERT
  WITH CHECK (is_admin()); -- Только через API/admin

-- UPDATE: worker (check-in/out), admin
CREATE POLICY "Workers can update own assignments"
  ON shift_assignments FOR UPDATE
  USING (
    is_worker_owner(worker_id) OR is_admin()
  );

-- DELETE: только admin
CREATE POLICY "Only admins can delete assignments"
  ON shift_assignments FOR DELETE
  USING (is_admin());

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- SELECT: client (owner), admin
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (
    is_client_owner(client_id) OR is_admin()
  );

-- INSERT: только система (при создании смены)
CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  WITH CHECK (is_admin());

-- UPDATE: только система (webhooks) или admin
CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  USING (is_admin());

-- DELETE: только admin
CREATE POLICY "Only admins can delete payments"
  ON payments FOR DELETE
  USING (is_admin());

-- ============================================================================
-- WORKER_PAYOUTS
-- ============================================================================

-- SELECT: worker (owner), admin
CREATE POLICY "Workers can view own payouts"
  ON worker_payouts FOR SELECT
  USING (
    is_worker_owner(worker_id) OR is_admin()
  );

-- INSERT: только система
CREATE POLICY "System can create payouts"
  ON worker_payouts FOR INSERT
  WITH CHECK (is_admin());

-- UPDATE: только система или admin
CREATE POLICY "System can update payouts"
  ON worker_payouts FOR UPDATE
  USING (is_admin());

-- DELETE: только admin
CREATE POLICY "Only admins can delete payouts"
  ON worker_payouts FOR DELETE
  USING (is_admin());

-- ============================================================================
-- DISPUTES
-- ============================================================================

-- SELECT: участники (client/worker) или admin
CREATE POLICY "Participants can view disputes"
  ON disputes FOR SELECT
  USING (
    is_shift_participant(shift_id) OR is_admin()
  );

-- INSERT: участники смены
CREATE POLICY "Participants can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (
    is_shift_participant(shift_id)
    AND raised_by = auth.uid()
  );

-- UPDATE: только admin (резолюция)
CREATE POLICY "Only admins can update disputes"
  ON disputes FOR UPDATE
  USING (is_admin());

-- DELETE: только admin
CREATE POLICY "Only admins can delete disputes"
  ON disputes FOR DELETE
  USING (is_admin());

-- ============================================================================
-- MESSAGES
-- ============================================================================

-- SELECT: участники смены или admin
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    is_shift_participant(shift_id) OR is_admin()
  );

-- INSERT: участники смены
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    is_shift_participant(shift_id)
    AND sender_id = auth.uid()
  );

-- UPDATE: нельзя (immutable)
-- DELETE: только admin (модерация)
CREATE POLICY "Only admins can delete messages"
  ON messages FOR DELETE
  USING (is_admin());

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- SELECT: только owner (user_id)
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: только система
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin());

-- UPDATE: owner (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    -- Можно менять только read статус
    user_id = OLD.user_id
    AND type = OLD.type
    AND title = OLD.title
    AND body = OLD.body
  );

-- DELETE: owner или admin
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================================
-- TRUST_EVENTS
-- ============================================================================

-- SELECT: только admin
CREATE POLICY "Only admins can view trust events"
  ON trust_events FOR SELECT
  USING (is_admin());

-- INSERT: только система
CREATE POLICY "System can create trust events"
  ON trust_events FOR INSERT
  WITH CHECK (is_admin());

-- UPDATE: только admin
CREATE POLICY "Only admins can update trust events"
  ON trust_events FOR UPDATE
  USING (is_admin());

-- DELETE: только admin
CREATE POLICY "Only admins can delete trust events"
  ON trust_events FOR DELETE
  USING (is_admin());

-- ============================================================================
-- Indexes for RLS Performance
-- ============================================================================

-- Ускоряем проверки RLS
CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_client_id ON shifts(client_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_worker_id ON shift_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_shift_applications_shift_id ON shift_applications(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_worker_id ON shift_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_id ON shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_worker_payouts_worker_id ON worker_payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_disputes_shift_id ON disputes(shift_id);
CREATE INDEX IF NOT EXISTS idx_messages_shift_id ON messages(shift_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_user_id ON trust_events(user_id);

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Authenticated users могут работать с данными (через RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Проверить включен ли RLS:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Проверить политики:
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';

-- Протестировать политики (от имени пользователя):
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims.sub = 'user-id-here';
-- SELECT * FROM shifts; -- должен видеть только свои/открытые
