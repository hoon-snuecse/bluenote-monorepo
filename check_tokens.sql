-- google_tokens 테이블의 데이터 확인
SELECT user_email, COUNT(*) as token_count 
FROM google_tokens 
GROUP BY user_email;

-- 특정 이메일의 토큰 확인 (이메일 주소를 실제 값으로 변경)
-- SELECT * FROM google_tokens WHERE user_email = 'your-email@example.com';
