-- Create storage bucket for shed images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shed-images', 
  'shed-images', 
  true, 
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policies
CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shed-images');

CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shed-images');

CREATE POLICY "Anyone can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'shed-images');

CREATE POLICY "Anyone can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shed-images');