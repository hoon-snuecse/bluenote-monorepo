-- google_tokens 테이블의 RLS 완전 비활성화
ALTER TABLE google_tokens DISABLE ROW LEVEL SECURITY;

-- 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Users can manage their own tokens" ON google_tokens;
DROP POLICY IF EXISTS "Users can read their own tokens" ON google_tokens;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON google_tokens;
DROP POLICY IF EXISTS "Allow anonymous updates" ON google_tokens;
