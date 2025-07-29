-- Bluenote Monorepo: 크로스 도메인 세션 공유를 위한 세션 테이블 생성
-- 실행 날짜: 2025-01-29
-- 목적: NextAuth v4의 쿠키 도메인 제한 우회 및 중앙 세션 관리

-- 1. 세션 테이블 생성
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 테이블에 대한 설명 추가
COMMENT ON TABLE public.sessions IS '크로스 도메인 세션 공유를 위한 중앙 세션 저장소';
COMMENT ON COLUMN public.sessions.session_token IS 'NextAuth 세션 토큰 (고유값)';
COMMENT ON COLUMN public.sessions.user_id IS 'auth.users 테이블의 사용자 ID';
COMMENT ON COLUMN public.sessions.expires IS '세션 만료 시간';
COMMENT ON COLUMN public.sessions.data IS '추가 세션 데이터 (권한, 메타데이터 등)';

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 사용자는 자신의 세션만 접근 가능
CREATE POLICY "Users can only access their own sessions" 
  ON public.sessions
  FOR ALL 
  USING (auth.uid() = user_id);

-- 서비스 역할은 모든 세션 접근 가능 (백엔드 관리용)
CREATE POLICY "Service role can access all sessions" 
  ON public.sessions
  FOR ALL 
  TO service_role
  USING (true);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_sessions_token ON public.sessions(session_token);
CREATE INDEX idx_sessions_expires ON public.sessions(expires);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);

-- 6. 자동 updated_at 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. updated_at 자동 업데이트 트리거 생성
CREATE TRIGGER update_sessions_updated_at 
  BEFORE UPDATE ON public.sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 만료된 세션 정리를 위한 함수 (선택사항)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sessions 
  WHERE expires < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 9. 세션 통계를 위한 뷰 (선택사항)
CREATE OR REPLACE VIEW session_stats AS
SELECT 
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN expires > NOW() THEN 1 END) as active_sessions,
  COUNT(CASE WHEN expires <= NOW() THEN 1 END) as expired_sessions
FROM public.sessions;

-- 10. 세션 생성/업데이트를 위한 헬퍼 함수
CREATE OR REPLACE FUNCTION upsert_session(
  p_session_token TEXT,
  p_user_id UUID,
  p_expires TIMESTAMP WITH TIME ZONE,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO public.sessions (session_token, user_id, expires, data)
  VALUES (p_session_token, p_user_id, p_expires, p_data)
  ON CONFLICT (session_token) 
  DO UPDATE SET 
    expires = EXCLUDED.expires,
    data = EXCLUDED.data,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- 실행 확인
SELECT 'Session table migration completed successfully' as status;