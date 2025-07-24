-- 현재 로그인한 사용자의 토큰 확인
SELECT * FROM google_tokens WHERE user_email = 'hoon@snuecse.org';

-- 모든 토큰 확인 (개인정보 보호를 위해 일부만)
SELECT user_email, 
       LEFT(access_token, 20) as token_preview,
       expires_at,
       created_at,
       updated_at
FROM google_tokens
ORDER BY updated_at DESC;
