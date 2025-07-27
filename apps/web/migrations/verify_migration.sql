-- 마이그레이션 검증 스크립트
-- usage_logs에서 user_daily_stats로의 데이터 이전이 완료되었는지 확인

-- 1. 원본 데이터 vs 이전된 데이터 비교
WITH usage_logs_summary AS (
  SELECT 
    'usage_logs' as source,
    COUNT(DISTINCT user_email) as unique_users,
    COUNT(CASE WHEN action_type = 'login' THEN 1 END) as total_logins,
    COUNT(CASE WHEN action_type = 'claude_api_call' THEN 1 END) as total_claude_usage,
    MIN(created_at::date) as min_date,
    MAX(created_at::date) as max_date
  FROM public.usage_logs
  WHERE user_email IS NOT NULL
),
user_daily_stats_summary AS (
  SELECT 
    'user_daily_stats' as source,
    COUNT(DISTINCT user_email) as unique_users,
    SUM(login_count) as total_logins,
    SUM(claude_usage_count) as total_claude_usage,
    MIN(date) as min_date,
    MAX(date) as max_date
  FROM public.user_daily_stats
)
SELECT * FROM usage_logs_summary
UNION ALL
SELECT * FROM user_daily_stats_summary;

-- 2. 날짜별 로그인 수 비교
WITH usage_logs_daily AS (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as login_count_original
  FROM public.usage_logs
  WHERE action_type = 'login' 
    AND user_email IS NOT NULL
  GROUP BY DATE(created_at)
),
user_daily_stats_daily AS (
  SELECT 
    date,
    SUM(login_count) as login_count_migrated
  FROM public.user_daily_stats
  GROUP BY date
)
SELECT 
  COALESCE(u.date, s.date) as date,
  COALESCE(u.login_count_original, 0) as original_logins,
  COALESCE(s.login_count_migrated, 0) as migrated_logins,
  CASE 
    WHEN u.login_count_original = s.login_count_migrated THEN '✅ 일치'
    WHEN u.login_count_original IS NULL THEN '⚠️ 원본 없음'
    WHEN s.login_count_migrated IS NULL THEN '❌ 마이그레이션 누락'
    ELSE '❌ 불일치'
  END as status
FROM usage_logs_daily u
FULL OUTER JOIN user_daily_stats_daily s ON u.date = s.date
ORDER BY date DESC
LIMIT 30;

-- 3. 사용자별 데이터 검증
WITH user_comparison AS (
  SELECT 
    COALESCE(u.user_email, s.user_email) as user_email,
    COUNT(DISTINCT u.id) as usage_logs_records,
    COUNT(DISTINCT s.id) as daily_stats_records,
    SUM(CASE WHEN u.action_type = 'login' THEN 1 ELSE 0 END) as usage_logs_logins,
    SUM(s.login_count) as daily_stats_logins
  FROM (
    SELECT * FROM public.usage_logs WHERE user_email IS NOT NULL
  ) u
  FULL OUTER JOIN public.user_daily_stats s 
    ON u.user_email = s.user_email 
    AND DATE(u.created_at) = s.date
  GROUP BY COALESCE(u.user_email, s.user_email)
)
SELECT 
  user_email,
  usage_logs_records,
  daily_stats_records,
  usage_logs_logins,
  daily_stats_logins,
  CASE 
    WHEN usage_logs_logins = daily_stats_logins THEN '✅ 일치'
    WHEN usage_logs_logins > daily_stats_logins THEN '⚠️ 일부 누락'
    WHEN usage_logs_logins < daily_stats_logins THEN '⚠️ 초과 마이그레이션'
    ELSE '❓ 확인 필요'
  END as status
FROM user_comparison
WHERE usage_logs_records > 0 OR daily_stats_records > 0
ORDER BY user_email;

-- 4. 누락된 데이터 확인
SELECT 
  'usage_logs에만 있는 데이터' as category,
  COUNT(*) as count
FROM public.usage_logs u
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.user_daily_stats s 
  WHERE s.user_email = u.user_email 
    AND s.date = DATE(u.created_at)
)
  AND u.user_email IS NOT NULL

UNION ALL

SELECT 
  'user_daily_stats에만 있는 데이터' as category,
  COUNT(*) as count
FROM public.user_daily_stats s
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.usage_logs u 
  WHERE u.user_email = s.user_email 
    AND DATE(u.created_at) = s.date
);

-- 5. 테이블 크기 및 상태
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
  AND tablename IN ('usage_logs', 'user_daily_stats', 'daily_stats')
ORDER BY tablename;