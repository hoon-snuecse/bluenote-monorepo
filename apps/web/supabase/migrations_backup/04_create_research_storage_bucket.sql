-- Check if bucket exists and update it, or create new one
DO $$
BEGIN
  -- Update existing bucket to allow PDF and document types
  UPDATE storage.buckets 
  SET 
    file_size_limit = 52428800, -- 50MB limit per file (Supabase free tier limit)
    allowed_mime_types = ARRAY[
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/wav',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'video/mp4',
      'video/mpeg'
    ]
  WHERE id = 'research-images';
  
  -- If no rows were updated, insert new bucket
  IF NOT FOUND THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'research-images', 
      'research-images', 
      true, 
      52428800,
      ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/html',
        'audio/wav',
        'audio/x-wav',
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'video/mp4',
        'video/mpeg'
      ]
    );
  END IF;
END $$;

-- Create storage policies (IF NOT EXISTS)
DO $$
BEGIN
  -- Check and create policies only if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Research files are publicly accessible'
  ) THEN
    CREATE POLICY "Research files are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'research-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload research files'
  ) THEN
    CREATE POLICY "Anyone can upload research files"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'research-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can update research files'
  ) THEN
    CREATE POLICY "Anyone can update research files"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'research-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete research files'
  ) THEN
    CREATE POLICY "Anyone can delete research files"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'research-images');
  END IF;
END $$;