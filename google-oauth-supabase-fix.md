# Google OAuth와 Supabase 통합 설정 수정 가이드

## 문제 원인
현재 Google OAuth 설정이 Supabase를 거치지 않고 직접 앱으로 리다이렉트하도록 설정되어 있어 "Unable to exchange external code" 에러가 발생합니다.

## 해결 방법

### 1. Supabase OAuth Callback URL 확인
1. Supabase Dashboard 접속
2. Authentication > Providers > Google 이동
3. "Callback URL (for OAuth)" 확인 - 다음과 같은 형태여야 함:
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
   예: `https://ukxchcyvxnbmsfksamjk.supabase.co/auth/v1/callback`

### 2. Google Cloud Console에서 Redirect URIs 정리

**추가해야 할 URI (Supabase 전용):**
```
https://[프로젝트ID].supabase.co/auth/v1/callback
```

**삭제해야 할 URI들 (직접 앱 callback):**
- ❌ https://bluenote.site/api/auth/callback/google
- ❌ https://www.bluenote.site/api/auth/callback/google  
- ❌ https://grading.bluenote.site/api/auth/callback/google
- ❌ https://grading.bluenote.site/api/auth/google/callback
- ❌ https://bluenote-web.vercel.app/api/auth/callback/google
- ❌ https://quiz.bluenote.site/api/auth/callback/google
- ❌ http://localhost:3000/api/auth/callback/google
- ❌ http://localhost:3001/api/auth/callback/google
- ❌ http://localhost:3001/api/auth/google/callback
- ❌ http://localhost:3003/api/auth/callback/google

**유지해도 되는 URI들 (NextAuth 사용하는 앱들):**
- ✅ https://bluenote.site/api/auth/callback/google (Web 앱이 아직 NextAuth 사용 중)
- ✅ https://grading.bluenote.site/api/auth/callback/google (Grading 앱이 아직 NextAuth 사용 중)

### 3. Supabase Dashboard 설정 확인

#### Site URL
- 현재: https://bluenote.site
- 변경 필요 없음

#### Redirect URLs (Authentication > URL Configuration)
다음 URL들이 모두 추가되어 있어야 함:
```
https://bluenote.site/auth/callback
https://quiz.bluenote.site/auth/callback
https://grading.bluenote.site/auth/callback
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
http://localhost:3003/auth/callback
```

## 작동 원리

### 올바른 OAuth 플로우:
1. 사용자가 quiz.bluenote.site에서 로그인 클릭
2. Supabase가 Google OAuth로 리다이렉트
3. Google이 Supabase callback URL로 리턴 (https://[프로젝트ID].supabase.co/auth/v1/callback)
4. Supabase가 코드를 교환하고 세션 생성
5. Supabase가 quiz.bluenote.site/auth/callback으로 리다이렉트
6. 앱이 세션을 받아 /create로 최종 리다이렉트

### 현재 잘못된 플로우:
1. Google이 직접 quiz.bluenote.site/api/auth/callback/google로 리턴
2. Supabase가 코드를 받지 못해 "Unable to exchange external code" 에러 발생

## 즉시 해야 할 작업

1. Google Cloud Console에서 Supabase callback URL만 남기고 나머지 삭제
2. 변경사항 저장
3. 브라우저 캐시/쿠키 삭제 후 테스트

이렇게 수정하면 로그인이 정상적으로 작동할 것입니다.