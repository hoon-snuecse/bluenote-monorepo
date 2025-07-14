-- Complete Database Schema for BlueNote Atelier
-- This file consolidates all migrations into a single, organized schema
-- Run this file to set up the entire database from scratch

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- Shed Posts
CREATE TABLE IF NOT EXISTS shed_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT '평온한',
  weather TEXT DEFAULT '맑음',
  music TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Posts
CREATE TABLE IF NOT EXISTS research_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_files (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES research_posts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teaching Posts
CREATE TABLE IF NOT EXISTS teaching_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Posts
CREATE TABLE IF NOT EXISTS analytics_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER MANAGEMENT TABLES
-- ============================================

-- User Permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  claude_daily_limit INTEGER DEFAULT 3,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT REFERENCES user_permissions(email) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('claude_chat', 'post_write', 'post_edit', 'post_delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create update function with secure search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = '';
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to all posts tables
CREATE TRIGGER update_shed_posts_updated_at BEFORE UPDATE ON shed_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_posts_updated_at BEFORE UPDATE ON research_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teaching_posts_updated_at BEFORE UPDATE ON teaching_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_posts_updated_at BEFORE UPDATE ON analytics_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shed_posts_created_at ON shed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_posts_category ON research_posts(category);
CREATE INDEX IF NOT EXISTS idx_research_posts_created_at ON research_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teaching_posts_category ON teaching_posts(category);
CREATE INDEX IF NOT EXISTS idx_teaching_posts_created_at ON teaching_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_posts_category ON analytics_posts(category);
CREATE INDEX IF NOT EXISTS idx_analytics_posts_created_at ON analytics_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_email, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type, created_at);

-- ============================================
-- 5. ROW LEVEL SECURITY (SIMPLIFIED)
-- ============================================

-- Disable RLS for user_permissions to avoid auth issues
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Enable RLS for posts tables (optional - can be enabled later)
-- ALTER TABLE shed_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE research_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teaching_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. VIEWS FOR REPORTING
-- ============================================

CREATE OR REPLACE VIEW daily_usage_summary AS
SELECT 
  user_email,
  action_type,
  DATE(created_at) as usage_date,
  COUNT(*) as action_count
FROM usage_logs
GROUP BY user_email, action_type, DATE(created_at);

-- ============================================
-- 7. INITIAL DATA
-- ============================================

-- Insert initial admin user
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', claude_daily_limit = 999999, can_write = true;

-- ============================================
-- 8. STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================
-- Note: Storage buckets must be created via Supabase Dashboard:
-- 1. shed-images (public)
-- 2. research-images (public)
-- 3. teaching-images (public)
-- 4. analytics-images (public)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:

-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check admin user
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';