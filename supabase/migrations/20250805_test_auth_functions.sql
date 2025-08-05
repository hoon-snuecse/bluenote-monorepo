-- JWT claims 테스트 함수
CREATE OR REPLACE FUNCTION get_jwt_claims()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jsonb_build_object(
      'email', auth.jwt() ->> 'email',
      'sub', auth.jwt() ->> 'sub',
      'role', auth.jwt() ->> 'role',
      'aud', auth.jwt() ->> 'aud',
      'iat', auth.jwt() ->> 'iat',
      'exp', auth.jwt() ->> 'exp'
    );
$$;

-- RLS에서 사용되는 이메일 확인 함수
CREATE OR REPLACE FUNCTION test_rls_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.jwt() ->> 'email';
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION get_jwt_claims() TO authenticated;
GRANT EXECUTE ON FUNCTION test_rls_email() TO authenticated;