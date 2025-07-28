# Google OAuth 설정 가이드

## Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. 좌측 메뉴에서 "APIs & Services" → "Credentials" 선택

## OAuth 2.0 클라이언트 설정

### 1. OAuth 2.0 클라이언트 ID 생성
- "CREATE CREDENTIALS" → "OAuth client ID" 선택
- Application type: "Web application" 선택
- Name: "Bluenote Quiz App" (또는 원하는 이름)

### 2. 승인된 JavaScript 원본 (Authorized JavaScript origins)
다음 URL들을 추가:
```
https://quiz.bluenote.site
http://localhost:3003
```

### 3. 승인된 리다이렉트 URI (Authorized redirect URIs)
다음 URL들을 반드시 추가:
```
https://quiz.bluenote.site/api/auth/callback/google
http://localhost:3003/api/auth/callback/google
```

## 중요 사항

1. **정확한 URL 입력**: 
   - 끝에 슬래시(/)를 붙이지 않음
   - https/http 구분 정확히
   - 포트 번호 정확히 (로컬: 3003)

2. **NextAuth 콜백 URL 형식**:
   - 반드시 `/api/auth/callback/google` 경로 사용
   - NextAuth.js의 기본 콜백 경로

3. **설정 저장 후**:
   - 변경사항 저장 클릭
   - 몇 분 정도 반영 시간 필요할 수 있음

## Vercel 환경 변수 확인

Vercel 대시보드에서 다음 환경 변수가 올바르게 설정되었는지 확인:

- `GOOGLE_CLIENT_ID`: OAuth 2.0 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: OAuth 2.0 클라이언트 시크릿
- `NEXTAUTH_URL`: https://quiz.bluenote.site (프로덕션)

## 테스트 방법

1. 설정 완료 후 https://quiz.bluenote.site/auth/signin 접속
2. "Google로 계속하기" 버튼 클릭
3. Google 로그인 진행

## 일반적인 오류 해결

### redirect_uri_mismatch 오류
- Google Console의 리다이렉트 URI와 실제 요청 URI가 정확히 일치하는지 확인
- 프로토콜(http/https), 도메인, 포트, 경로 모두 일치해야 함

### 400 오류
- 클라이언트 ID와 시크릿이 올바른지 확인
- Vercel 환경 변수가 제대로 설정되었는지 확인
- NEXTAUTH_URL이 실제 도메인과 일치하는지 확인