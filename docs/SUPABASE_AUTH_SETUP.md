# Supabase Auth 설정 가이드 (v0.2.0)

> 최종 업데이트: 2025-08-08
> 
> v0.2.0부터 모든 앱이 통합된 @bluenote/supabase-auth 패키지를 사용합니다.

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

### 모든 앱 공통 설정 (v0.2.0)

각 앱의 `.env.local`에 다음 추가:

```bash
# Supabase Auth (모든 앱 동일)
NEXT_PUBLIC_SUPABASE_URL=https://ukxchcyvxnbmsfrsamjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGNoY3l2eG5ibXNmcnNhbWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTY2NjIsImV4cCI6MjA2NzM5MjY2Mn0.5xnB8uzJu1uxq7S9f7rueKwv0GbiHc4V2uyYgpynvTE
SUPABASE_SERVICE_ROLE_KEY=[서비스 롤 키]

# 앱별 포트 설정
# Web: 3000 (기본)
# Grading: 3002
# Quiz: 3003
```

### 쿠키 설정 (중요)

v0.2.0부터 크로스 도메인 세션 공유를 위해 다음 설정이 자동 적용됩니다:
- Domain: `.bluenote.site` (프로덕션)
- httpOnly: `false` (클라이언트 접근 허용)
- SameSite: `lax`
- Secure: `true` (프로덕션)

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

## 5. 코드 사용법 (v0.2.0)

### 클라이언트 컴포넌트
```javascript
import { useSupabaseAuth } from '@bluenote/supabase-auth'

export default function Component() {
  const { user, session, loading, signInWithGoogle, signOut } = useSupabaseAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <button onClick={signInWithGoogle}>Login</button>
  
  return (
    <div>
      Welcome {user.email}
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### 서버 컴포넌트 (Route Handler)
```javascript
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'

export async function GET(request) {
  const supabase = createRouteHandlerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 인증된 사용자 로직
}
```

## 6. 테스트 체크리스트

- [ ] Google OAuth 로그인 테스트
- [ ] 세션 유지 확인 (새로고침 후에도 유지)
- [ ] 크로스 도메인 세션 공유 확인 (web ↔ grading ↔ quiz)
- [ ] RLS 정책 동작 확인
- [ ] 기존 데이터 접근 확인
- [ ] 로그아웃 기능 테스트
- [ ] Navigation 컴포넌트 로그인 상태 표시 확인