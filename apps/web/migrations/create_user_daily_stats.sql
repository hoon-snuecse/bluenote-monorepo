-- user_daily_stats 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  claude_usage_count INTEGER DEFAULT 0,
  grading_sonnet_count INTEGER DEFAULT 0,
  grading_opus_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  last_device TEXT,
  last_browser TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_email, date)
);

-- 인덱스 생성
CREATE INDEX idx_user_daily_stats_email ON public.user_daily_stats(user_email);
CREATE INDEX idx_user_daily_stats_date ON public.user_daily_stats(date);
CREATE INDEX idx_user_daily_stats_email_date ON public.user_daily_stats(user_email, date);

-- RLS 활성화
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Service Role만 접근 가능하도록 RLS 정책 설정
CREATE POLICY "Service role only" ON public.user_daily_stats
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 기본 권한 제거
REVOKE ALL ON public.user_daily_stats FROM anon, authenticated;

-- Service Role에게만 권한 부여
GRANT ALL ON public.user_daily_stats TO service_role;
GRANT USAGE ON SEQUENCE public.user_daily_stats_id_seq TO service_role;

-- PostgREST가 Service Role로 접근할 때도 처리
DO $$ 
BEGIN
  -- Service Role이 이미 권한을 가지고 있는지 확인
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges 
    WHERE grantee = 'service_role' 
    AND table_schema = 'public' 
    AND table_name = 'user_daily_stats'
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON public.user_daily_stats TO service_role;
  END IF;
END $$;

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_daily_stats_updated_at 
  BEFORE UPDATE ON public.user_daily_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (오늘 날짜 기준)
INSERT INTO public.user_daily_stats (user_email, date, login_count, claude_usage_count, grading_sonnet_count, grading_opus_count, last_login_at, last_device, last_browser)
VALUES 
  ('hoon@snuecse.org', CURRENT_DATE, 16, 0, 3, 2, CURRENT_TIMESTAMP, 'Desktop', 'Chrome'),
  ('hoon@iw.es.kr', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('sociogram@gmail.com', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('waurimal@snuecse.org', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('sscola@snuecse.org', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('jaeremis@snuecse.org', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('iuz4ksk@gmail.com', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL),
  ('bio2810@gmail.com', CURRENT_DATE, 0, 0, 0, 0, NULL, NULL, NULL)
ON CONFLICT (user_email, date) DO NOTHING;

-- 지난 7일간의 샘플 데이터 (hoon@snuecse.org만)
INSERT INTO public.user_daily_stats (user_email, date, login_count, claude_usage_count, grading_sonnet_count, grading_opus_count, last_login_at)
VALUES 
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '1 day', 2, 0, 0, 0, CURRENT_DATE - INTERVAL '1 day'),
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '2 day', 23, 1, 0, 0, CURRENT_DATE - INTERVAL '2 day'),
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '3 day', 0, 0, 0, 0, NULL),
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '4 day', 0, 0, 0, 0, NULL),
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '5 day', 0, 0, 0, 0, NULL),
  ('hoon@snuecse.org', CURRENT_DATE - INTERVAL '6 day', 0, 0, 0, 0, NULL)
ON CONFLICT (user_email, date) DO NOTHING;

-- PostgREST 캐시 강제 새로고침
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';