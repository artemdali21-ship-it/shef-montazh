-- Storage Bucket for Chat Images
-- Run this in Supabase SQL Editor

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload chat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = 'chat'
);

-- Policy: Allow everyone to read chat images (since bucket is public)
CREATE POLICY "Allow public read access to chat images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Policy: Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own chat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = 'chat' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);
