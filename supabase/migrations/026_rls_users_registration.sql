-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own record during registration
-- This allows auth.uid() to insert a record with their own ID
CREATE POLICY "Users can insert their own record during registration"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own data
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public (anon) to insert during registration
-- This is needed because during signup, the user is not yet authenticated
CREATE POLICY "Allow public insert during registration"
ON users
FOR INSERT
TO anon
WITH CHECK (true);

-- Note: After registration, the anon policy should be removed
-- and only authenticated users should be able to insert
-- But for MVP, we keep it to allow smooth registration flow
