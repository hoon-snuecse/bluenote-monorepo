-- usage_logs 테이블 생성 (로그인 활동 기록용)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_usage_logs_user_email ON public.usage_logs(user_email);
CREATE INDEX idx_usage_logs_action_type ON public.usage_logs(action_type);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX idx_usage_logs_user_email_created_at ON public.usage_logs(user_email, created_at);

-- RLS 활성화
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Service Role만 접근 가능하도록 RLS 정책 설정
CREATE POLICY "Service role only" ON public.usage_logs
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 기본 권한 제거
REVOKE ALL ON public.usage_logs FROM anon, authenticated;

-- Service Role에게만 권한 부여
GRANT ALL ON public.usage_logs TO service_role;
GRANT USAGE ON SEQUENCE public.usage_logs_id_seq TO service_role;

-- PostgREST 캐시 강제 새로고침
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';