-- 기존 usage_logs 데이터를 daily_stats로 마이그레이션
-- 최근 30일 데이터 집계

-- 1. usage_logs 기반 통계 삽입
INSERT INTO daily_stats (
  date,
  login_count,
  unique_login_count,
  claude_usage_count,
  post_write_count
)
SELECT 
  DATE(created_at) as date,
  COUNT(CASE WHEN action_type = 'login' THEN 1 END) as login_count,
  COUNT(DISTINCT CASE WHEN action_type = 'login' THEN user_email END) as unique_login_count,
  COUNT(CASE WHEN action_type = 'claude_chat' THEN 1 END) as claude_usage_count,
  COUNT(CASE WHEN action_type = 'post_write' THEN 1 END) as post_write_count
FROM usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ON CONFLICT (date) 
DO UPDATE SET
  login_count = EXCLUDED.login_count,
  unique_login_count = EXCLUDED.unique_login_count,
  claude_usage_count = EXCLUDED.claude_usage_count,
  post_write_count = EXCLUDED.post_write_count,
  updated_at = NOW();

-- 2. 게시물 통계 업데이트
-- Research posts
UPDATE daily_stats ds
SET research_post_count = subq.count
FROM (
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM research_posts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) subq
WHERE ds.date = subq.date;

-- Teaching posts
UPDATE daily_stats ds
SET teaching_post_count = subq.count
FROM (
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM teaching_posts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) subq
WHERE ds.date = subq.date;

-- Analytics posts
UPDATE daily_stats ds
SET analytics_post_count = subq.count
FROM (
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM analytics_posts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) subq
WHERE ds.date = subq.date;

-- Shed posts
UPDATE daily_stats ds
SET shed_post_count = subq.count
FROM (
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM shed_posts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) subq
WHERE ds.date = subq.date;

-- 3. 총 게시물 수 계산
UPDATE daily_stats
SET total_post_count = research_post_count + teaching_post_count + analytics_post_count + shed_post_count;

-- 4. 누락된 날짜 채우기 (최근 30일)
INSERT INTO daily_stats (date)
SELECT generate_series(
  CURRENT_DATE - INTERVAL '29 days',
  CURRENT_DATE,
  INTERVAL '1 day'
)::date
ON CONFLICT (date) DO NOTHING;

-- 5. 검증 쿼리
SELECT 
  date,
  login_count,
  unique_login_count,
  claude_usage_count,
  post_write_count,
  total_post_count
FROM daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;