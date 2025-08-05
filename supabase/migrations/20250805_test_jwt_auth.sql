-- JWT 인증 테스트 함수
CREATE OR REPLACE FUNCTION test_jwt_auth()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'auth_uid', auth.uid(),
    'auth_email', auth.email(),
    'jwt_data', auth.jwt(),
    'jwt_email', auth.jwt() ->> 'email',
    'jwt_sub', auth.jwt() ->> 'sub',
    'jwt_claim_email', current_setting('request.jwt.claim.email', true),
    'current_user_email', current_setting('app.current_user_email', true)
  );
END;
$$;