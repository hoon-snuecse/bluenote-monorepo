# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel 프로젝트 설정에서 다음 환경 변수들을 반드시 설정해야 합니다:

### 1. Supabase 설정
- `NEXT_PUBLIC_SUPABASE_URL`: https://ukxchcyvxnbmsfrsamjk.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트의 anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 프로젝트의 service role key

### 2. NextAuth 설정
- `NEXTAUTH_SECRET`: 랜덤한 비밀 키 (openssl rand -base64 32로 생성)
- `NEXTAUTH_URL`: https://quiz.bluenote.site (프로덕션)

### 3. Google OAuth 설정
- `GOOGLE_CLIENT_ID`: Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 시크릿

### 4. Claude AI 설정
- `ANTHROPIC_API_KEY`: Anthropic에서 발급받은 API 키

### 5. 디버깅 (선택사항)
- `NEXTAUTH_DEBUG`: true (개발/디버깅 시), false 또는 미설정 (프로덕션)

## 설정 방법

1. Vercel 대시보드에서 bluenote-quiz 프로젝트 선택
2. Settings → Environment Variables 메뉴 이동
3. 각 환경 변수 추가:
   - Key: 환경 변수 이름
   - Value: 실제 값
   - Environment: Production, Preview, Development 모두 체크

## Google OAuth 콜백 URL 설정

Google Cloud Console에서 다음 리다이렉트 URI를 추가해야 합니다:
- 프로덕션: https://quiz.bluenote.site/api/auth/callback/google
- 로컬 개발: http://localhost:3003/api/auth/callback/google

## 주의사항

1. `NEXTAUTH_URL`은 프로덕션에서는 반드시 https://quiz.bluenote.site로 설정
2. 모든 환경 변수는 대소문자를 정확히 구분해서 입력
3. NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 클라이언트에서도 접근 가능
4. 환경 변수 변경 후 재배포 필요