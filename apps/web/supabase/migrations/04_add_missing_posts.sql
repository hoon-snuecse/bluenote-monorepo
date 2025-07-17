-- Add missing posts from local files to database
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD MISSING RESEARCH POST (Coffee + SNA)
-- ============================================
INSERT INTO research_posts (
  title, 
  content, 
  category, 
  tags, 
  summary,
  reading_time,
  created_at,
  updated_at
) VALUES 
(
  '커피와 함께하는 SNA: 네트워크 사고의 확장',
  '# 커피와 함께하는 SNA: 네트워크 사고의 확장

## 들어가며

오늘도 어김없이 아침 커피를 내리며 생각합니다. 이 원두가 나에게 오기까지의 여정을...

## 커피 농장의 네트워크

에티오피아 예가체프의 작은 농장에서 시작된 이 원두는 수많은 관계를 거쳐 제 컵에 담겼습니다.

### 생산자 네트워크
- 농부들의 협동조합
- 가공 스테이션의 품질 관리자
- 수출업자와 수입업자의 연결

### 로스터와 소비자의 관계
신뢰는 어떻게 구축되는가? 직거래가 만드는 새로운 네트워크 구조...

## SNA로 보는 커피 산업

Social Network Analysis를 통해 커피 산업의 구조를 분석해보면...

### 중심성(Centrality) 분석
- 어떤 행위자가 네트워크의 허브 역할을 하는가?
- 정보와 자원의 흐름은 어떻게 이루어지는가?

### 구조적 공백(Structural Holes)
- 직거래가 메우는 구조적 공백
- 새로운 가치 창출의 기회

## 마치며

한 잔의 커피 속에도 복잡한 네트워크가 숨어있습니다. 우리가 매일 마시는 이 커피가 만들어내는 연결, 그리고 그 연결이 만드는 가치에 대해 생각해봅니다.',
  'coffee',
  ARRAY['커피', 'SNA', '네트워크분석', '직거래', '소셜네트워크'],
  '커피 산업을 소셜 네트워크 분석의 관점에서 바라본 융합적 사고',
  10,
  '2025-06-25T08:00:00Z',
  '2025-06-25T08:00:00Z'
);

-- ============================================
-- 2. CHECK EXISTING DATA IN ALL TABLES
-- ============================================
SELECT '=== Current Post Counts ===' as info;
SELECT 'research_posts' as table_name, COUNT(*) as count FROM research_posts
UNION ALL
SELECT 'teaching_posts', COUNT(*) FROM teaching_posts
UNION ALL
SELECT 'analytics_posts', COUNT(*) FROM analytics_posts
UNION ALL
SELECT 'shed_posts', COUNT(*) FROM shed_posts
ORDER BY table_name;

-- ============================================
-- 3. LIST ALL POSTS WITH BASIC INFO
-- ============================================
SELECT '=== Research Posts ===' as section;
SELECT id, title, category, created_at FROM research_posts ORDER BY created_at DESC;

SELECT '=== Teaching Posts ===' as section;
SELECT id, title, category, created_at FROM teaching_posts ORDER BY created_at DESC;

SELECT '=== Analytics Posts ===' as section;
SELECT id, title, category, created_at FROM analytics_posts ORDER BY created_at DESC;

SELECT '=== Shed Posts ===' as section;
SELECT id, title, category, created_at FROM shed_posts ORDER BY created_at DESC;

-- ============================================
-- 4. CHECK FOR ANY OLDER DATA
-- ============================================
-- Check if there are posts created before today
SELECT '=== Posts Created Before Today ===' as info;
SELECT 'research_posts' as table_name, COUNT(*) as old_posts 
FROM research_posts WHERE created_at < CURRENT_DATE
UNION ALL
SELECT 'teaching_posts', COUNT(*) 
FROM teaching_posts WHERE created_at < CURRENT_DATE
UNION ALL
SELECT 'analytics_posts', COUNT(*) 
FROM analytics_posts WHERE created_at < CURRENT_DATE
UNION ALL
SELECT 'shed_posts', COUNT(*) 
FROM shed_posts WHERE created_at < CURRENT_DATE;