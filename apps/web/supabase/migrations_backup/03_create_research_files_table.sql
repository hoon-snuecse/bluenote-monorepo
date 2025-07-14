-- Create research_post_files table for storing document files (PDF, etc.)
CREATE TABLE IF NOT EXISTS research_post_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES research_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_type TEXT, -- 'document' or 'image'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_research_post_files_post_id ON research_post_files(post_id);

-- Enable Row Level Security
ALTER TABLE research_post_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Research files are viewable by everyone" 
  ON research_post_files FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can manage research files" 
  ON research_post_files FOR ALL 
  USING (true);