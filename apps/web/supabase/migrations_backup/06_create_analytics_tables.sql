-- Create analytics_posts table
CREATE TABLE IF NOT EXISTS analytics_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  reading_time TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_post_images table
CREATE TABLE IF NOT EXISTS analytics_post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES analytics_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_post_files table
CREATE TABLE IF NOT EXISTS analytics_post_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES analytics_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analytics_posts_category ON analytics_posts(category);
CREATE INDEX idx_analytics_posts_created_at ON analytics_posts(created_at DESC);
CREATE INDEX idx_analytics_post_images_post_id ON analytics_post_images(post_id);
CREATE INDEX idx_analytics_post_files_post_id ON analytics_post_files(post_id);

-- Enable Row Level Security
ALTER TABLE analytics_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_post_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Analytics posts are viewable by everyone" 
  ON analytics_posts FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage analytics posts" 
  ON analytics_posts FOR ALL 
  USING (true);

CREATE POLICY "Analytics images are viewable by everyone" 
  ON analytics_post_images FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage analytics images" 
  ON analytics_post_images FOR ALL 
  USING (true);

CREATE POLICY "Analytics files are viewable by everyone" 
  ON analytics_post_files FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage analytics files" 
  ON analytics_post_files FOR ALL 
  USING (true);