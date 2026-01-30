-- Enable Row Level Security on shifts table
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to SELECT all shifts
CREATE POLICY "Allow anonymous users to read all shifts"
ON shifts
FOR SELECT
TO anon
USING (true);

-- Optional: Allow authenticated users to read all shifts as well
CREATE POLICY "Allow authenticated users to read all shifts"
ON shifts
FOR SELECT
TO authenticated
USING (true);
