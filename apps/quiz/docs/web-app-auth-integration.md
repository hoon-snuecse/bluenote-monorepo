# Web 앱 인증 통합 가이드 (v0.2.0)

> 최종 업데이트: 2025-01-08

## 개요

v0.2.0부터 모든 앱(Web, Grading, Quiz)이 통합된 @bluenote/supabase-auth 패키지를 사용하여 인증을 처리합니다.

## 주요 변경사항 (v0.2.0)

### 1. 통합 인증 패키지
- 모든 앱이 `@bluenote/supabase-auth` 패키지 사용
- NextAuth 의존성 제거
- Supabase Auth로 완전 마이그레이션

### 2. 쿠키 설정
크로스 도메인 세션 공유를 위한 자동 설정:
```javascript
{
  domain: '.bluenote.site',    // 프로덕션
  httpOnly: false,             // 클라이언트 접근 허용
  sameSite: 'lax',
  secure: true                 // HTTPS 필수
}
```

### 3. 환경 변수 (v0.2.0)
```bash
# Supabase (모든 앱 동일)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# 앱별 URL 및 포트
NEXTAUTH_URL=http://localhost:3003  # Quiz 앱
```

### 4. Supabase 대시보드 설정
Authentication > URL Configuration:
- Site URL: `https://bluenote.site`
- Redirect URLs:
  - `https://quiz.bluenote.site/auth/callback`
  - `http://localhost:3003/auth/callback`

## 인증 플로우 (v0.2.0)

1. 사용자가 Quiz 앱에서 로그인 버튼 클릭
2. Supabase가 Google OAuth 로그인 페이지로 리디렉션
3. 로그인 성공 시 `/auth/callback` 라우트로 리턴
4. 세션이 `.bluenote.site` 도메인 쿠키에 저장
5. 모든 앱(Web, Grading, Quiz)에서 세션 공유

## 코드 구현 (v0.2.0)

### Navigation 컴포넌트
```javascript
import { useSupabaseAuth } from '@bluenote/supabase-auth'

export function Navigation() {
  const { user, loading, signOut } = useSupabaseAuth()
  
  return (
    <nav>
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={signOut}>로그아웃</button>
        </>
      ) : (
        <Link href="/auth/signin">로그인</Link>
      )}
    </nav>
  )
}
```

### Session Check API
```javascript
// app/api/auth/session-check/route.js
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'

export async function GET() {
  const supabase = createRouteHandlerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return Response.json({
    authenticated: !!session,
    user: session?.user || null
  })
}
```

## 문제 해결

### Navigation이 로그인 상태를 표시하지 않는 문제
- 원인: useSupabaseAuth 훅이 user 속성을 직접 제공하지 않음
- 해결: v0.2.0에서 provider 수정으로 해결됨

### 크로스 도메인 쿠키 공유 안 되는 문제
- 원인: httpOnly가 true로 설정됨
- 해결: httpOnly를 false로 설정하여 클라이언트 접근 허용