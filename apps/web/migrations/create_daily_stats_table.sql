-- 일별 통계 테이블 생성
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  -- 로그인 통계
  login_count INTEGER DEFAULT 0,
  unique_login_count INTEGER DEFAULT 0,
  -- Claude 사용 통계
  claude_usage_count INTEGER DEFAULT 0,
  -- 게시물 통계
  post_write_count INTEGER DEFAULT 0,
  research_post_count INTEGER DEFAULT 0,
  teaching_post_count INTEGER DEFAULT 0,
  analytics_post_count INTEGER DEFAULT 0,
  shed_post_count INTEGER DEFAULT 0,
  total_post_count INTEGER DEFAULT 0,
  -- 채점 통계 (향후 추가용)
  grading_sonnet_count INTEGER DEFAULT 0,
  grading_opus_count INTEGER DEFAULT 0,
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 날짜 인덱스 (빠른 조회용)
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
CREATE TRIGGER update_daily_stats_updated_at 
BEFORE UPDATE ON daily_stats 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- RLS 비활성화 (관리자만 접근)
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;