-- Create image metadata tables for all post types
-- These tables store metadata about images uploaded to Supabase Storage

-- ============================================
-- SHED POST IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS shed_post_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES shed_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_shed_post_images_post_id ON shed_post_images(post_id);

-- ============================================
-- RESEARCH POST IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS research_post_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES research_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_research_post_images_post_id ON research_post_images(post_id);

-- ============================================
-- TEACHING POST IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS teaching_post_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES teaching_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_teaching_post_images_post_id ON teaching_post_images(post_id);

-- ============================================
-- ANALYTICS POST IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_post_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES analytics_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_analytics_post_images_post_id ON analytics_post_images(post_id);

-- ============================================
-- Add missing columns to existing posts tables
-- ============================================

-- Add columns to shed_posts if they don't exist
ALTER TABLE shed_posts 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- Add columns to research_posts if they don't exist
ALTER TABLE research_posts 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- Add columns to teaching_posts if they don't exist
ALTER TABLE teaching_posts 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- Add columns to analytics_posts if they don't exist
ALTER TABLE analytics_posts 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;