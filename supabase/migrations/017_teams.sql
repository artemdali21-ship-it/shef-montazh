-- Teams table for shef-montazhniki
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shef_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, worker_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_shef_id ON teams(shef_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_worker_id ON team_members(worker_id);

-- RLS Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Shefs can view own teams"
  ON teams FOR SELECT
  USING (auth.uid() = shef_id);

CREATE POLICY "Shefs can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = shef_id);

CREATE POLICY "Shefs can update own teams"
  ON teams FOR UPDATE
  USING (auth.uid() = shef_id);

CREATE POLICY "Shefs can delete own teams"
  ON teams FOR DELETE
  USING (auth.uid() = shef_id);

-- Workers can view teams they're in
CREATE POLICY "Workers can view their teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.worker_id = auth.uid()
    )
  );

-- Team members policies
CREATE POLICY "Shefs can view team members"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.shef_id = auth.uid()
    )
  );

CREATE POLICY "Shefs can add team members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.shef_id = auth.uid()
    )
  );

CREATE POLICY "Shefs can remove team members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.shef_id = auth.uid()
    )
  );

-- Workers can view their own team memberships
CREATE POLICY "Workers can view own memberships"
  ON team_members FOR SELECT
  USING (worker_id = auth.uid());

-- Function to get team stats
CREATE OR REPLACE FUNCTION get_team_stats(team_uuid UUID)
RETURNS TABLE (
  member_count BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(tm.worker_id)::BIGINT,
    COALESCE(AVG(wp.rating), 0)::NUMERIC
  FROM team_members tm
  LEFT JOIN worker_profiles wp ON wp.user_id = tm.worker_id
  WHERE tm.team_id = team_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
