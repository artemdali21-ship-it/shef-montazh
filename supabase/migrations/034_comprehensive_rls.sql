-- Comprehensive RLS Policies for All Tables
-- Ensures proper data isolation and security

-- ========================================
-- SHIFTS TABLE
-- ========================================

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Clients see their own shifts
CREATE POLICY "clients_view_own_shifts"
  ON shifts FOR SELECT
  USING (client_id::text = auth.uid()::text);

-- Workers see published shifts
CREATE POLICY "workers_view_published_shifts"
  ON shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'worker'
    )
    AND status IN ('published', 'applications', 'accepted')
  );

-- Workers see shifts they're assigned to
CREATE POLICY "workers_view_assigned_shifts"
  ON shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shift_assignments
      WHERE shift_assignments.shift_id = shifts.id
      AND shift_assignments.worker_id::text = auth.uid()::text
    )
  );

-- Shefs see their own shifts
CREATE POLICY "shefs_view_own_shifts"
  ON shifts FOR SELECT
  USING (
    shef_id::text = auth.uid()::text
  );

-- Admins see all
CREATE POLICY "admins_view_all_shifts"
  ON shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ========================================
-- SHIFT_APPLICATIONS TABLE
-- ========================================

ALTER TABLE shift_applications ENABLE ROW LEVEL SECURITY;

-- Only shift parties can view applications
CREATE POLICY "parties_view_applications"
  ON shift_applications FOR SELECT
  USING (
    worker_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_applications.shift_id
      AND shifts.client_id::text = auth.uid()::text
    )
  );

-- Workers can create applications
CREATE POLICY "workers_create_applications"
  ON shift_applications FOR INSERT
  WITH CHECK (worker_id::text = auth.uid()::text);

-- ========================================
-- SHIFT_ASSIGNMENTS TABLE
-- ========================================

ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- Only shift parties can view assignments
CREATE POLICY "parties_view_assignments"
  ON shift_assignments FOR SELECT
  USING (
    worker_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_assignments.shift_id
      AND shifts.client_id::text = auth.uid()::text
    )
  );

-- ========================================
-- RATINGS TABLE
-- ========================================

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Only shift parties can view ratings
CREATE POLICY "parties_view_ratings"
  ON ratings FOR SELECT
  USING (
    rater_id::text = auth.uid()::text
    OR rated_user_id::text = auth.uid()::text
  );

-- Users can create ratings
CREATE POLICY "users_create_ratings"
  ON ratings FOR INSERT
  WITH CHECK (rater_id::text = auth.uid()::text);

-- ========================================
-- PAYMENTS TABLE
-- ========================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Only shift parties can view payments
CREATE POLICY "parties_view_payments"
  ON payments FOR SELECT
  USING (
    client_id::text = auth.uid()::text
    OR worker_id::text = auth.uid()::text
  );

-- ========================================
-- FAVORITES TABLE
-- ========================================

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users view own favorites
CREATE POLICY "users_view_own_favorites"
  ON favorites FOR ALL
  USING (user_id::text = auth.uid()::text);

-- ========================================
-- BLOCKED_USERS TABLE
-- ========================================

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Users manage own blocks
CREATE POLICY "users_manage_blocks"
  ON blocked_users FOR ALL
  USING (blocker_id::text = auth.uid()::text);

COMMENT ON POLICY "clients_view_own_shifts" ON shifts IS 'Clients can view their own posted shifts';
COMMENT ON POLICY "workers_view_published_shifts" ON shifts IS 'Workers can view published shifts available for application';
