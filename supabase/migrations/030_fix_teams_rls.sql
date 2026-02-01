-- Fix teams RLS policies to avoid infinite recursion

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Teams are viewable by members" ON teams;
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams can be updated by owners" ON teams;
DROP POLICY IF EXISTS "Teams can be deleted by owners" ON teams;

-- Create simple, non-recursive policies
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teams can be created by authenticated users"
  ON teams FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

CREATE POLICY "Teams can be updated by owner"
  ON teams FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teams can be deleted by owner"
  ON teams FOR DELETE
  USING (created_by = auth.uid());
