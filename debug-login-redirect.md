# 로그인 리다이렉트 문제 디버깅 가이드

## 문제 현상
- quiz.bluenote.site에서 로그인 시 www.bluenote.site로 리다이렉트됨
- 첫 번째 로그인 시 재로그인 요구
- 두 번째 로그인 시 메인 사이트로 이동

## 원인 분석 및 점검 사항

### 1. Supabase Dashboard 설정 확인

#### a) Site URL 설정
- **현재 위치**: Authentication > URL Configuration > Site URL
- **현재 설정**: https://bluenote.site
- **문제점**: Supabase Auth는 기본적으로 Site URL로 리다이렉트함
- **해결 방안**: 
  - 옵션 1: Site URL을 변경하지 않고 유지
  - 옵션 2: 각 앱별로 별도의 Supabase 프로젝트 사용 (권장하지 않음)

#### b) Redirect URLs 설정
- **현재 위치**: Authentication > URL Configuration > Redirect URLs
- **필수 URL들**:
  ```
  https://bluenote.site/auth/callback
  https://quiz.bluenote.site/auth/callback
  https://grading.bluenote.site/auth/callback
  http://localhost:3000/auth/callback
  http://localhost:3002/auth/callback
  http://localhost:3003/auth/callback
  ```
- **확인 방법**: 위 URL들이 모두 추가되어 있는지 확인

### 2. Google OAuth 설정 확인

#### Google Cloud Console에서 확인
1. https://console.cloud.google.com 접속
2. APIs & Services > Credentials
3. OAuth 2.0 Client IDs에서 사용 중인 클라이언트 선택
4. Authorized redirect URIs 확인:
   ```
   https://bluenote.site/auth/callback
   https://quiz.bluenote.site/auth/callback
   https://grading.bluenote.site/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3002/auth/callback
   http://localhost:3003/auth/callback
   ```

### 3. 브라우저 개발자 도구로 추적

1. Chrome DevTools > Network 탭 열기
2. Preserve log 체크
3. quiz.bluenote.site에서 로그인 시도
4. 다음 순서 확인:
   - Google OAuth로 리다이렉트
   - Supabase callback URL로 리턴
   - 최종 리다이렉트 위치

### 4. 환경 변수 확인

#### Quiz 앱 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
```

#### Vercel 환경 변수
- Quiz 앱 프로젝트에서 위 환경 변수가 설정되어 있는지 확인

### 5. 코드 레벨 디버깅

#### a) 로그 확인 위치
- 브라우저 콘솔: OAuth settings 로그
- Vercel Functions 로그: Quiz app auth callback received 로그

#### b) 쿠키 확인
- Chrome DevTools > Application > Cookies
- sb-* 쿠키들의 Domain이 .bluenote.site인지 확인

## 즉시 시도할 수 있는 해결 방안

### 1. Supabase Dashboard에서 OAuth Provider 설정 수정

1. Supabase Dashboard > Authentication > Providers > Google 이동
2. "Callback URL (for OAuth)" 섹션 확인
3. 현재 표시된 URL이 `https://[프로젝트ID].supabase.co/auth/v1/callback` 형태인지 확인
4. 이 URL을 Google Cloud Console의 Authorized redirect URIs에 추가

### 2. Supabase Auth Hook 설정

Supabase Dashboard > Authentication > Hooks에서 Post-authentication hook 추가:
```sql
-- 로그인 후 원래 도메인으로 리다이렉트하는 Hook
CREATE OR REPLACE FUNCTION handle_auth_redirect()
RETURNS trigger AS $$
BEGIN
  -- 로그인 소스 도메인 확인 후 적절한 리다이렉트 처리
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. 현재 구현된 임시 해결책

DomainChecker 컴포넌트가 Quiz 앱에 추가되어:
- 메인 도메인으로 잘못 리다이렉트된 경우 자동으로 quiz.bluenote.site로 이동
- 세션 정보와 URL 파라미터 유지

## 근본적 해결 방안

### 옵션 1: Supabase Auth 커스터마이징
- supabase.auth.signInWithOAuth에서 skipBrowserRedirect 옵션 사용
- 수동으로 OAuth 플로우 처리

### 옵션 2: 프록시 서버 구성
- 모든 auth 요청을 메인 도메인으로 프록시
- 세션 설정 후 원래 도메인으로 리다이렉트

### 옵션 3: 단일 인증 도메인
- auth.bluenote.site 같은 별도 인증 도메인 사용
- 모든 앱이 이 도메인으로 인증 처리

## 다음 단계

1. 위 점검 사항을 하나씩 확인
2. 브라우저 네트워크 로그 수집
3. Supabase와 Google OAuth 설정 스크린샷 확인
4. 필요시 Supabase 지원팀에 문의