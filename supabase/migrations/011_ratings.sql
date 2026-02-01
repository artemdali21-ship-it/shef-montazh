-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate ratings
  UNIQUE(shift_id, from_user_id, to_user_id)
);

-- Create indexes
CREATE INDEX idx_ratings_shift ON ratings(shift_id);
CREATE INDEX idx_ratings_from_user ON ratings(from_user_id);
CREATE INDEX idx_ratings_to_user ON ratings(to_user_id);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view ratings they gave or received"
  ON ratings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = from_user_id OR
    auth.uid() = to_user_id
  );

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own ratings within 24 hours"
  ON ratings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = from_user_id AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- Function to update user's average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the rated user's average rating
  UPDATE users
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM ratings
    WHERE to_user_id = NEW.to_user_id
  )
  WHERE id = NEW.to_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user rating
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to check if both parties have rated each other
CREATE OR REPLACE FUNCTION check_mutual_ratings(shift_uuid UUID, user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ratings
    WHERE shift_id = shift_uuid
    AND from_user_id = user1_uuid
    AND to_user_id = user2_uuid
  ) AND EXISTS (
    SELECT 1 FROM ratings
    WHERE shift_id = shift_uuid
    AND from_user_id = user2_uuid
    AND to_user_id = user1_uuid
  );
END;
$$ LANGUAGE plpgsql;
