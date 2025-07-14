-- Create shed_posts table
CREATE TABLE IF NOT EXISTS shed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shed_post_images table
CREATE TABLE IF NOT EXISTS shed_post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES shed_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_shed_posts_created_at ON shed_posts(created_at DESC);
CREATE INDEX idx_shed_posts_category ON shed_posts(category);
CREATE INDEX idx_shed_post_images_post_id ON shed_post_images(post_id);

-- Enable Row Level Security
ALTER TABLE shed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shed_post_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Posts are viewable by everyone" 
  ON shed_posts FOR SELECT 
  USING (true);

CREATE POLICY "Post images are viewable by everyone" 
  ON shed_post_images FOR SELECT 
  USING (true);

-- For now, allow all operations (you can restrict this later with authentication)
CREATE POLICY "Anyone can create posts" 
  ON shed_posts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update posts" 
  ON shed_posts FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete posts" 
  ON shed_posts FOR DELETE 
  USING (true);

CREATE POLICY "Anyone can manage post images" 
  ON shed_post_images FOR ALL 
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_shed_posts_updated_at 
  BEFORE UPDATE ON shed_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();