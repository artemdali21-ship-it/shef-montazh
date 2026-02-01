-- Apply migration 029: Fix shift status from 'open' to 'published'

-- Drop old policies
DROP POLICY IF EXISTS "Workers can view open shifts" ON shifts;
DROP POLICY IF EXISTS "Workers can apply to shifts" ON shift_applications;

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
