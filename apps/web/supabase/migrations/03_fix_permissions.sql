-- Fix database permissions and check data
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. GRANT PERMISSIONS TO ANON AND AUTHENTICATED ROLES
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Specifically grant permissions on post tables
GRANT SELECT ON shed_posts TO anon;
GRANT SELECT ON research_posts TO anon;
GRANT SELECT ON teaching_posts TO anon;
GRANT SELECT ON analytics_posts TO anon;

GRANT SELECT ON shed_post_images TO anon;
GRANT SELECT ON research_post_images TO anon;
GRANT SELECT ON teaching_post_images TO anon;
GRANT SELECT ON analytics_post_images TO anon;

-- Grant full permissions to authenticated users
GRANT ALL ON shed_posts TO authenticated;
GRANT ALL ON research_posts TO authenticated;
GRANT ALL ON teaching_posts TO authenticated;
GRANT ALL ON analytics_posts TO authenticated;

GRANT ALL ON shed_post_images TO authenticated;
GRANT ALL ON research_post_images TO authenticated;
GRANT ALL ON teaching_post_images TO authenticated;
GRANT ALL ON analytics_post_images TO authenticated;

-- ============================================
-- 2. DISABLE RLS TEMPORARILY FOR TESTING
-- ============================================
ALTER TABLE shed_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_posts DISABLE ROW LEVEL SECURITY;

ALTER TABLE shed_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_post_images DISABLE ROW LEVEL SECURITY;

ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CHECK IF TABLES EXIST AND HAVE DATA
-- ============================================
SELECT 'Tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT '--- Post counts ---' as info;
SELECT 'shed_posts' as table_name, COUNT(*) as count FROM shed_posts
UNION ALL
SELECT 'research_posts', COUNT(*) FROM research_posts
UNION ALL
SELECT 'teaching_posts', COUNT(*) FROM teaching_posts
UNION ALL
SELECT 'analytics_posts', COUNT(*) FROM analytics_posts;

-- ============================================
-- 4. INSERT SAMPLE DATA IF TABLES ARE EMPTY
-- ============================================

-- Check and insert sample shed post if empty
INSERT INTO shed_posts (title, content, mood, weather, category, created_at)
SELECT 
  '첫 번째 일상 글',
  '오늘은 좋은 날입니다. 데이터베이스가 드디어 작동하기 시작했습니다!',
  '기쁜',
  '맑음',
  'daily',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM shed_posts LIMIT 1);

-- Check and insert sample research post if empty
INSERT INTO research_posts (title, content, category, tags, created_at)
SELECT 
  '첫 번째 연구 글',
  '# 연구 시작\n\n이것은 첫 번째 연구 포스트입니다.',
  'research',
  ARRAY['테스트', '시작'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM research_posts LIMIT 1);

-- Check and insert sample teaching post if empty
INSERT INTO teaching_posts (title, content, category, tags, created_at)
SELECT 
  '첫 번째 교육 글',
  '# 교육의 시작\n\n학생들과 함께하는 첫 번째 수업입니다.',
  'teaching',
  ARRAY['교육', '수업'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM teaching_posts LIMIT 1);

-- Check and insert sample analytics post if empty
INSERT INTO analytics_posts (title, content, category, tags, created_at)
SELECT 
  '첫 번째 분석 글',
  '# 데이터 분석\n\n흥미로운 데이터를 발견했습니다.',
  'analytics',
  ARRAY['분석', '데이터'],
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM analytics_posts LIMIT 1);

-- ============================================
-- 5. FINAL CHECK
-- ============================================
SELECT '--- Final post counts ---' as info;
SELECT 'shed_posts' as table_name, COUNT(*) as count FROM shed_posts
UNION ALL
SELECT 'research_posts', COUNT(*) FROM research_posts
UNION ALL
SELECT 'teaching_posts', COUNT(*) FROM teaching_posts
UNION ALL
SELECT 'analytics_posts', COUNT(*) FROM analytics_posts;