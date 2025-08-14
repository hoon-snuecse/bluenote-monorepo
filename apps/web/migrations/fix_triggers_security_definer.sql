-- 트리거 함수들이 SECURITY DEFINER로 실행되도록 수정
-- 이렇게 하면 일반 사용자가 글을 작성해도 트리거는 슈퍼유저 권한으로 daily_stats를 업데이트할 수 있음

-- 1. usage_logs 트리거 함수 수정
CREATE OR REPLACE FUNCTION update_daily_stats_from_logs()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_date DATE;
BEGIN
  -- 로그의 날짜 추출
  target_date := DATE(NEW.created_at);
  
  -- 해당 날짜의 레코드가 없으면 생성
  INSERT INTO daily_stats (date)
  VALUES (target_date)
  ON CONFLICT (date) DO NOTHING;
  
  -- action_type에 따라 카운트 업데이트
  CASE NEW.action_type
    WHEN 'login' THEN
      UPDATE daily_stats 
      SET login_count = login_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
      
      -- unique_login_count는 별도로 계산 (중복 제거 필요)
      UPDATE daily_stats
      SET unique_login_count = (
        SELECT COUNT(DISTINCT user_email)
        FROM usage_logs
        WHERE DATE(created_at) = target_date
          AND action_type = 'login'
      )
      WHERE date = target_date;
      
    WHEN 'claude_chat' THEN
      UPDATE daily_stats 
      SET claude_usage_count = claude_usage_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
      
    WHEN 'post_write' THEN
      UPDATE daily_stats 
      SET post_write_count = post_write_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 게시물 테이블 트리거 함수 수정
CREATE OR REPLACE FUNCTION update_daily_stats_from_posts()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_date DATE;
  table_name TEXT;
BEGIN
  target_date := DATE(NEW.created_at);
  table_name := TG_TABLE_NAME;
  
  -- 해당 날짜의 레코드가 없으면 생성
  INSERT INTO daily_stats (date)
  VALUES (target_date)
  ON CONFLICT (date) DO NOTHING;
  
  -- 테이블명에 따라 해당 카운트 업데이트
  CASE table_name
    WHEN 'research_posts' THEN
      UPDATE daily_stats 
      SET research_post_count = research_post_count + 1,
          total_post_count = total_post_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
      
    WHEN 'teaching_posts' THEN
      UPDATE daily_stats 
      SET teaching_post_count = teaching_post_count + 1,
          total_post_count = total_post_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
      
    WHEN 'analytics_posts' THEN
      UPDATE daily_stats 
      SET analytics_post_count = analytics_post_count + 1,
          total_post_count = total_post_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
      
    WHEN 'shed_posts' THEN
      UPDATE daily_stats 
      SET shed_post_count = shed_post_count + 1,
          total_post_count = total_post_count + 1,
          updated_at = NOW()
      WHERE date = target_date;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 권한 확인 (선택사항)
-- 트리거 함수 소유자와 권한 확인
SELECT 
    p.proname AS function_name,
    r.rolname AS owner,
    p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname IN ('update_daily_stats_from_logs', 'update_daily_stats_from_posts');