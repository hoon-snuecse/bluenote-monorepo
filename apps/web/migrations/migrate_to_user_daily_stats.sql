-- 기존 데이터를 user_daily_stats로 마이그레이션
-- 이 스크립트는 usage_logs, daily_stats, grading 데이터를 통합합니다

-- 1. usage_logs 테이블에서 로그인 데이터 마이그레이션 (있는 경우)
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  login_count,
  last_login_at
)
SELECT 
  user_email,
  DATE(created_at) as date,
  COUNT(*) as login_count,
  MAX(created_at) as last_login_at
FROM public.usage_logs
WHERE action_type = 'login'
  AND user_email IS NOT NULL
GROUP BY user_email, DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  login_count = EXCLUDED.login_count,
  last_login_at = EXCLUDED.last_login_at;

-- 2. Claude 사용 통계 마이그레이션 (usage_logs에서)
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  claude_usage_count
)
SELECT 
  user_email,
  DATE(created_at) as date,
  COUNT(*) as claude_usage_count
FROM public.usage_logs
WHERE action_type = 'claude_api_call'
  AND user_email IS NOT NULL
GROUP BY user_email, DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  claude_usage_count = EXCLUDED.claude_usage_count;

-- 3. 게시물 작성 통계 마이그레이션
-- research_posts
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  post_count
)
SELECT 
  'hoon@snuecse.org' as user_email, -- 작성자 정보가 없다면 기본값
  DATE(created_at) as date,
  COUNT(*) as post_count
FROM public.research_posts
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  post_count = user_daily_stats.post_count + EXCLUDED.post_count;

-- shed_posts
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  post_count
)
SELECT 
  'hoon@snuecse.org' as user_email,
  DATE(created_at) as date,
  COUNT(*) as post_count
FROM public.shed_posts
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  post_count = user_daily_stats.post_count + EXCLUDED.post_count;

-- teaching_posts
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  post_count
)
SELECT 
  'hoon@snuecse.org' as user_email,
  DATE(created_at) as date,
  COUNT(*) as post_count
FROM public.teaching_posts
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  post_count = user_daily_stats.post_count + EXCLUDED.post_count;

-- analytics_posts
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  post_count
)
SELECT 
  'hoon@snuecse.org' as user_email,
  DATE(created_at) as date,
  COUNT(*) as post_count
FROM public.analytics_posts
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  post_count = user_daily_stats.post_count + EXCLUDED.post_count;

-- 4. 채점 통계 마이그레이션 (grading 앱의 데이터베이스에서)
-- 주의: grading 앱이 별도 데이터베이스를 사용하는 경우, 
-- Foreign Data Wrapper 또는 dblink를 사용하거나
-- grading 앱에서 직접 실행해야 합니다.

-- grading 앱과 같은 데이터베이스를 사용하는 경우:
INSERT INTO public.user_daily_stats (
  user_email, 
  date, 
  grading_sonnet_count,
  grading_opus_count
)
SELECT 
  evaluatedByUser as user_email,
  DATE(evaluatedAt) as date,
  SUM(CASE 
    WHEN evaluatedBy LIKE '%sonnet%' THEN 1 
    ELSE 0 
  END) as grading_sonnet_count,
  SUM(CASE 
    WHEN evaluatedBy LIKE '%opus%' THEN 1 
    ELSE 0 
  END) as grading_opus_count
FROM public."Evaluation"
WHERE evaluatedByUser IS NOT NULL
  AND evaluatedByUser != ''
GROUP BY evaluatedByUser, DATE(evaluatedAt)
ON CONFLICT (user_email, date) 
DO UPDATE SET
  grading_sonnet_count = user_daily_stats.grading_sonnet_count + EXCLUDED.grading_sonnet_count,
  grading_opus_count = user_daily_stats.grading_opus_count + EXCLUDED.grading_opus_count;

-- grading 앱이 별도 데이터베이스를 사용하는 경우 (수동 실행 필요):
/*
-- grading 데이터베이스에서 데이터 추출
COPY (
  SELECT 
    evaluatedByUser as user_email,
    DATE(evaluatedAt) as date,
    SUM(CASE WHEN evaluatedBy LIKE '%sonnet%' THEN 1 ELSE 0 END) as grading_sonnet_count,
    SUM(CASE WHEN evaluatedBy LIKE '%opus%' THEN 1 ELSE 0 END) as grading_opus_count
  FROM "Evaluation"
  WHERE evaluatedByUser IS NOT NULL AND evaluatedByUser != ''
  GROUP BY evaluatedByUser, DATE(evaluatedAt)
) TO '/tmp/grading_stats.csv' WITH CSV HEADER;

-- web 데이터베이스에서 데이터 가져오기
COPY user_daily_stats_temp (user_email, date, grading_sonnet_count, grading_opus_count) 
FROM '/tmp/grading_stats.csv' WITH CSV HEADER;

-- 임시 테이블에서 실제 테이블로 머지
INSERT INTO public.user_daily_stats (user_email, date, grading_sonnet_count, grading_opus_count)
SELECT * FROM user_daily_stats_temp
ON CONFLICT (user_email, date) 
DO UPDATE SET
  grading_sonnet_count = user_daily_stats.grading_sonnet_count + EXCLUDED.grading_sonnet_count,
  grading_opus_count = user_daily_stats.grading_opus_count + EXCLUDED.grading_opus_count;
*/

-- 5. daily_stats 테이블의 전체 통계와 비교하여 누락된 데이터 보정
-- 특정 사용자에게 할당되지 않은 통계를 관리자에게 할당
UPDATE public.user_daily_stats uds
SET 
  login_count = GREATEST(uds.login_count, 
    CASE 
      WHEN uds.user_email = 'hoon@snuecse.org' 
      THEN (SELECT COALESCE(ds.login_count, 0) FROM public.daily_stats ds WHERE ds.date = uds.date)
      ELSE uds.login_count
    END
  ),
  claude_usage_count = GREATEST(uds.claude_usage_count,
    CASE 
      WHEN uds.user_email = 'hoon@snuecse.org' 
      THEN (SELECT COALESCE(ds.claude_usage_count, 0) FROM public.daily_stats ds WHERE ds.date = uds.date)
      ELSE uds.claude_usage_count
    END
  )
WHERE uds.user_email = 'hoon@snuecse.org';

-- 6. 임시 데이터 정리 (실제 데이터로 대체된 후)
-- 샘플 데이터를 실제 데이터로 대체
DELETE FROM public.user_daily_stats
WHERE grading_sonnet_count = 50 
  AND grading_opus_count = 27
  AND user_email = 'hoon@snuecse.org'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_daily_stats uds2
    WHERE uds2.user_email = user_daily_stats.user_email
      AND uds2.date = user_daily_stats.date
      AND (uds2.grading_sonnet_count != 50 OR uds2.grading_opus_count != 27)
  );

-- 7. 정리할 테이블/컬럼 목록 (실행 전 백업 필수!)
-- 아래 명령들은 주석 처리되어 있습니다. 
-- 데이터 마이그레이션이 완료되고 검증된 후에만 실행하세요.

/*
-- usage_logs 테이블 삭제 (더 이상 필요없음)
DROP TABLE IF EXISTS public.usage_logs CASCADE;

-- daily_stats 테이블은 전체 통계 요약용으로 유지할 수 있음
-- 하지만 user_daily_stats로 완전히 대체한다면:
-- DROP TABLE IF EXISTS public.daily_stats CASCADE;

-- 기타 불필요한 컬럼이나 테이블이 있다면 여기에 추가
*/

-- 8. 데이터 검증 쿼리
SELECT 
  'Total users with stats' as metric,
  COUNT(DISTINCT user_email) as value
FROM public.user_daily_stats
UNION ALL
SELECT 
  'Total days with data' as metric,
  COUNT(DISTINCT date) as value
FROM public.user_daily_stats
UNION ALL
SELECT 
  'Total login records' as metric,
  SUM(login_count) as value
FROM public.user_daily_stats
UNION ALL
SELECT 
  'Total claude usage' as metric,
  SUM(claude_usage_count) as value
FROM public.user_daily_stats
UNION ALL
SELECT 
  'Total grading (sonnet)' as metric,
  SUM(grading_sonnet_count) as value
FROM public.user_daily_stats
UNION ALL
SELECT 
  'Total grading (opus)' as metric,
  SUM(grading_opus_count) as value
FROM public.user_daily_stats;