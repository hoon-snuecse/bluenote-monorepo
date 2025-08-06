# Web App Supabase OAuth 설정 가이드

## 현재 상황

Web 앱은 별도의 Supabase 프로젝트를 사용합니다:
- Project URL: https://ukxchcyvxnbmsfrsamjk.supabase.co
- 이 프로젝트에 Google OAuth Provider가 설정되어 있어야 합니다.

## Supabase Dashboard에서 확인할 사항

1. [Supabase Dashboard](https://app.supabase.com/project/ukxchcyvxnbmsfrsamjk/auth/providers)로 이동

2. Authentication > Providers > Google 섹션 확인:
   - Google Provider가 활성화되어 있는지
   - Client ID와 Client Secret이 설정되어 있는지
   - Authorized Client IDs에 Google OAuth Client ID가 추가되어 있는지

3. Authentication > URL Configuration 확인:
   - Site URL: http://localhost:3000 (개발) / https://www.bluenote.site (프로덕션)
   - Redirect URLs에 다음이 포함되어 있는지:
     - http://localhost:3000/auth/callback
     - https://www.bluenote.site/auth/callback

## Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 Client 설정

2. Authorized redirect URIs에 다음 추가:
   - `https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback` (Supabase OAuth endpoint)

## 문제 해결

### 현재 에러: redirect_uri_mismatch

이 에러는 Google OAuth 설정과 실제 요청하는 redirect URI가 일치하지 않을 때 발생합니다.

해결 방법:
1. Supabase Dashboard에서 Google OAuth Provider 설정 확인
2. Google Cloud Console에서 Supabase의 callback URL 추가
3. 필요시 Site URL과 Redirect URLs 업데이트

### 테스트 방법

1. http://localhost:3000/auth/debug 페이지에서 OAuth 테스트
2. 브라우저 개발자 도구에서 콘솔 로그 확인
3. Supabase Dashboard의 Auth Logs 확인