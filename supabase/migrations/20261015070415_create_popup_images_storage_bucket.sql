
-- Create a public storage bucket for popup images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'popup-images',
  'popup-images',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon + authenticated) to read popup images
DROP POLICY IF EXISTS "Public read popup images" ON storage.objects;
CREATE POLICY "Public read popup images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'popup-images');

-- Allow anyone (anon + authenticated) to upload popup images
DROP POLICY IF EXISTS "Public upload popup images" ON storage.objects;
CREATE POLICY "Public upload popup images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'popup-images');

-- Allow anyone (anon + authenticated) to delete popup images
DROP POLICY IF EXISTS "Public delete popup images" ON storage.objects;
CREATE POLICY "Public delete popup images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'popup-images');
