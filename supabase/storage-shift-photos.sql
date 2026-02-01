-- Create shift-photos bucket for check-in photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('shift-photos', 'shift-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for shift-photos bucket

-- Allow authenticated users to upload their own check-in photos
CREATE POLICY "Users can upload check-in photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shift-photos' AND
  (storage.foldername(name))[1] = 'check-ins'
);

-- Allow public read access to check-in photos
CREATE POLICY "Public can view check-in photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shift-photos');

-- Allow users to delete their own check-in photos
CREATE POLICY "Users can delete their own check-in photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shift-photos' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to update their own check-in photos
CREATE POLICY "Users can update their own check-in photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shift-photos' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
