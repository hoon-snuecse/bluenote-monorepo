-- Create storage buckets for teaching and analytics sections
DO $$
BEGIN
  -- Teaching bucket
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'teaching-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'teaching-images', 
      'teaching-images', 
      true, 
      52428800, -- 50MB limit (Supabase free tier)
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

  -- Analytics bucket
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'analytics-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'analytics-images', 
      'analytics-images', 
      true, 
      52428800, -- 50MB limit (Supabase free tier)
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

-- Create storage policies for teaching bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Teaching files are publicly accessible'
  ) THEN
    CREATE POLICY "Teaching files are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'teaching-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload teaching files'
  ) THEN
    CREATE POLICY "Anyone can upload teaching files"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'teaching-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can update teaching files'
  ) THEN
    CREATE POLICY "Anyone can update teaching files"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'teaching-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete teaching files'
  ) THEN
    CREATE POLICY "Anyone can delete teaching files"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'teaching-images');
  END IF;
END $$;

-- Create storage policies for analytics bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Analytics files are publicly accessible'
  ) THEN
    CREATE POLICY "Analytics files are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'analytics-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload analytics files'
  ) THEN
    CREATE POLICY "Anyone can upload analytics files"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'analytics-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can update analytics files'
  ) THEN
    CREATE POLICY "Anyone can update analytics files"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'analytics-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete analytics files'
  ) THEN
    CREATE POLICY "Anyone can delete analytics files"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'analytics-images');
  END IF;
END $$;