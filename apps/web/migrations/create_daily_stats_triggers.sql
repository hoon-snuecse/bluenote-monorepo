-- usage_logs 삽입 시 daily_stats를 자동 업데이트하는 트리거

-- 1. 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_daily_stats_from_logs()
RETURNS TRIGGER AS $$
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

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON usage_logs;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON usage_logs
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats_from_logs();

-- 3. 게시물 테이블들에 대한 트리거 함수
CREATE OR REPLACE FUNCTION update_daily_stats_from_posts()
RETURNS TRIGGER AS $$
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

-- 4. 각 게시물 테이블에 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_daily_stats_research ON research_posts;
CREATE TRIGGER trigger_update_daily_stats_research
AFTER INSERT ON research_posts
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats_from_posts();

DROP TRIGGER IF EXISTS trigger_update_daily_stats_teaching ON teaching_posts;
CREATE TRIGGER trigger_update_daily_stats_teaching
AFTER INSERT ON teaching_posts
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats_from_posts();

DROP TRIGGER IF EXISTS trigger_update_daily_stats_analytics ON analytics_posts;
CREATE TRIGGER trigger_update_daily_stats_analytics
AFTER INSERT ON analytics_posts
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats_from_posts();

DROP TRIGGER IF EXISTS trigger_update_daily_stats_shed ON shed_posts;
CREATE TRIGGER trigger_update_daily_stats_shed
AFTER INSERT ON shed_posts
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats_from_posts();