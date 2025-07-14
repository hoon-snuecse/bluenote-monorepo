-- Create teaching_posts table
CREATE TABLE IF NOT EXISTS teaching_posts (
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

-- Create teaching_post_images table
CREATE TABLE IF NOT EXISTS teaching_post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES teaching_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teaching_post_files table
CREATE TABLE IF NOT EXISTS teaching_post_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES teaching_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_teaching_posts_category ON teaching_posts(category);
CREATE INDEX idx_teaching_posts_created_at ON teaching_posts(created_at DESC);
CREATE INDEX idx_teaching_post_images_post_id ON teaching_post_images(post_id);
CREATE INDEX idx_teaching_post_files_post_id ON teaching_post_files(post_id);

-- Enable Row Level Security
ALTER TABLE teaching_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_post_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teaching posts are viewable by everyone" 
  ON teaching_posts FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage teaching posts" 
  ON teaching_posts FOR ALL 
  USING (true);

CREATE POLICY "Teaching images are viewable by everyone" 
  ON teaching_post_images FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage teaching images" 
  ON teaching_post_images FOR ALL 
  USING (true);

CREATE POLICY "Teaching files are viewable by everyone" 
  ON teaching_post_files FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage teaching files" 
  ON teaching_post_files FOR ALL 
  USING (true);