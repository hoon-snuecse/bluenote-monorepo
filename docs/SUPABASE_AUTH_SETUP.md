# Supabase Auth 설정 가이드

## 1. Supabase 대시보드 설정

### Google OAuth Provider 설정

1. [Supabase 대시보드](https://supabase.com/dashboard/project/ukxchcyvxnbmsfrsamjk/auth/providers) 접속
2. Authentication > Providers > Google 활성화
3. 다음 정보 입력:
   - **Client ID**: `[YOUR_GOOGLE_CLIENT_ID]`
   - **Client Secret**: `[YOUR_GOOGLE_CLIENT_SECRET]`

### Redirect URLs 설정

1. Authentication > URL Configuration에서 다음 설정:
   - **Site URL**: `https://bluenote.site`
   - **Redirect URLs**:
     ```
     https://bluenote.site/auth/callback
     https://quiz.bluenote.site/auth/callback
     https://grading.bluenote.site/auth/callback
     http://localhost:3000/auth/callback
     http://localhost:3002/auth/callback
     http://localhost:3003/auth/callback
     ```

### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 수정
3. **Authorized redirect URIs**에 추가:
   ```
   https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback
   ```

## 2. 환경 변수 설정

모든 앱의 `.env.local` 및 `.env.production`에 다음 추가:

```bash
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://ukxchcyvxnbmsfrsamjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGNoY3l2eG5ibXNmcnNhbWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTY2NjIsImV4cCI6MjA2NzM5MjY2Mn0.5xnB8uzJu1uxq7S9f7rueKwv0GbiHc4V2uyYgpynvTE
```

## 3. RLS 정책 마이그레이션

모든 RLS 정책을 다음과 같이 변경:

### 기존 (current_setting 방식)
```sql
CREATE POLICY "policy_name" ON table_name
FOR INSERT WITH CHECK (
  user_email = current_setting('app.current_user_email', true)
);
```

### 신규 (Supabase Auth 방식)
```sql
CREATE POLICY "policy_name" ON table_name
FOR INSERT WITH CHECK (
  user_email = auth.jwt() ->> 'email'
);
```

## 4. 사용자 마이그레이션

기존 사용자들은 동일한 Google 계정으로 로그인하면 자동으로 연결됩니다.
Supabase Auth는 이메일을 기준으로 사용자를 식별합니다.

## 5. 테스트 체크리스트

- [ ] Google OAuth 로그인 테스트
- [ ] 세션 유지 확인
- [ ] RLS 정책 동작 확인
- [ ] 기존 데이터 접근 확인
- [ ] 로그아웃 기능 테스트