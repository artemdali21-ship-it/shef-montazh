// Apply migration 029 to fix shift status and RLS policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyMigration() {
  console.log('Applying migration 029...');

  const sql = `
-- Drop old policies
DROP POLICY IF EXISTS "Workers can view open shifts" ON shifts;
DROP POLICY IF EXISTS "Workers can apply to shifts" ON shift_applications;
DROP POLICY IF EXISTS "Clients can create shifts" ON shifts;

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

CREATE POLICY "Clients can create shifts"
  ON shifts FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid()
    )
  );
`;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error.message);
    console.log('\nPlease apply the migration manually by running the SQL in supabase/migrations/029_fix_shift_status.sql');
    console.log('You can do this in the Supabase dashboard > SQL Editor');
  }
}

applyMigration();
