# Web 앱 인증 통합 가이드

## 개요

Quiz 앱은 별도의 Google OAuth 앱을 사용하지 않고 Web 앱의 인증 시스템을 공유합니다.

## 주요 변경사항

### 1. Google OAuth 스코프
- Web 앱: `openid email profile https://www.googleapis.com/auth/drive.file` (Google Drive 포함)
- Quiz 앱: `openid email profile` (Google Drive 제외)

### 2. 쿠키 설정
모든 앱이 동일한 쿠키 설정을 사용하여 서브도메인 간 세션 공유:
```javascript
domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined
```

### 3. 환경 변수
Quiz 앱은 Web 앱과 동일한 Google OAuth 자격 증명 사용:
- `GOOGLE_CLIENT_ID`: Web 앱과 동일
- `GOOGLE_CLIENT_SECRET`: Web 앱과 동일
- `NEXTAUTH_SECRET`: Web 앱과 동일
- `NEXTAUTH_URL`: https://quiz.bluenote.site

### 4. Google Console 설정
Web 앱의 OAuth 2.0 클라이언트에 Quiz 앱 URL 추가:
- 승인된 JavaScript 원본: `https://quiz.bluenote.site`
- 승인된 리디렉션 URI: `https://quiz.bluenote.site/api/auth/callback/google`

## 인증 플로우

1. 사용자가 Quiz 앱에서 로그인 버튼 클릭
2. Google OAuth 로그인 페이지로 리디렉션 (Google Drive 권한 없음)
3. 로그인 성공 시 세션 토큰이 `.bluenote.site` 도메인에 저장
4. Web 앱과 Quiz 앱 간 세션 공유

## 문제 해결

### 로그인 루프 문제
- 원인: Quiz 앱이 @bluenote/auth의 Google Drive 권한을 요구
- 해결: Quiz 앱 전용 authOptions 사용

### 쿠키가 3개가 아닌 2개만 생성되는 문제
- 정상: Quiz 앱은 Google Drive 접근 토큰이 없어 2개만 생성
- 쿠키 목록:
  1. `next-auth.session-token`: 세션 토큰
  2. `next-auth.csrf-token`: CSRF 보호

### AccessDenied 오류
- 원인: users 테이블 권한 체크
- 해결: Quiz 앱은 모든 사용자 허용