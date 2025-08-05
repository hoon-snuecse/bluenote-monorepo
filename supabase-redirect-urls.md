# Supabase Redirect URLs 설정

## 중요: Google OAuth 설정 먼저 확인!

### Google Cloud Console 설정 (필수)
1. https://console.cloud.google.com 접속
2. APIs & Services > Credentials > OAuth 2.0 Client IDs 선택
3. **Authorized redirect URIs에 다음 URL만 있어야 함:**
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
   - 이 URL은 Supabase Dashboard > Authentication > Providers > Google에서 확인 가능
   - 다른 /auth/callback URL들은 모두 삭제해야 함

### Supabase Dashboard 설정

Supabase Dashboard > Authentication > URL Configuration > Redirect URLs에 다음 URL들을 추가해주세요:

## Production URLs
```
https://bluenote.site/auth/callback
https://quiz.bluenote.site/auth/callback
https://grading.bluenote.site/auth/callback
```

## Development URLs
```
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
http://localhost:3003/auth/callback
```

## 설정 방법
1. Supabase Dashboard 접속
2. Authentication > URL Configuration 이동
3. Redirect URLs 섹션에서 위의 모든 URL 추가
4. Save 클릭

이렇게 설정하면 각 앱이 독립적으로 OAuth 콜백을 처리할 수 있습니다.