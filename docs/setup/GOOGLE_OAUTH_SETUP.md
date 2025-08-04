# Google OAuth 설정 가이드 (통합)

> 이 문서는 Bluenote 플랫폼의 모든 앱에서 사용하는 Google OAuth 설정을 안내합니다.

---
**상태**: ✅ 최신  
**최종 업데이트**: 2025년 8월 1일  
**적용 대상**: Web App, Grading System, Quiz Maker
---

## 📋 목차
1. [Google Cloud Console 설정](#1-google-cloud-console-설정)
2. [환경별 설정](#2-환경별-설정)
3. [앱별 환경 변수](#3-앱별-환경-변수)
4. [일반적인 문제 해결](#4-일반적인-문제-해결)
5. [보안 고려사항](#5-보안-고려사항)

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성 및 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Enabled APIs** 이동
4. 다음 API 활성화:
   - Google+ API (로그인용)
   - Google Drive API (Web App의 파일 업로드 기능용)

### 1.2 OAuth 2.0 Client ID 생성

1. **APIs & Services** → **Credentials** 이동
2. **Create Credentials** → **OAuth client ID** 선택
3. Application type: **Web application** 선택
4. 이름 입력: `Bluenote Platform`

### 1.3 Authorized JavaScript Origins 설정

다음 origin들을 모두 추가:

```
# Production
https://bluenote.site
https://www.bluenote.site
https://quiz.bluenote.site
https://grading.bluenote.site

# Development
http://localhost:3000
http://localhost:3001
http://localhost:3002
```

### 1.4 Authorized Redirect URIs 설정

다음 URI들을 모두 추가:

```
# Production - Web App
https://bluenote.site/api/auth/callback/google
https://www.bluenote.site/api/auth/callback/google

# Production - Quiz App
https://quiz.bluenote.site/api/auth/callback/google

# Production - Grading App
https://grading.bluenote.site/api/auth/callback/google

# Development
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
http://localhost:3002/api/auth/callback/google
```

### 1.5 OAuth Consent Screen 설정

1. **OAuth consent screen** 메뉴로 이동
2. 설정 내용:
   - **User type**: External
   - **Publishing status**: Production
   - **App name**: Bluenote Education Platform
   - **Support email**: 관리자 이메일
   - **Authorized domains**: `bluenote.site`
   - **Privacy policy**: `https://bluenote.site/privacy`
   - **Terms of service**: `https://bluenote.site/terms`

3. **Scopes** 설정:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.file` (Web App 전용)

## 2. 환경별 설정

### 2.1 개발 환경 (Local)

```bash
# .env.local
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 2.2 프로덕션 환경 (Vercel)

Vercel 프로젝트 설정에서 환경 변수 추가:

```bash
# Production 환경 변수
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=https://bluenote.site  # 각 앱에 맞게 설정
NEXTAUTH_SECRET=your-nextauth-secret
```

## 3. 앱별 환경 변수

### 3.1 Web App (메인 플랫폼)

```bash
# apps/web/.env.local
NEXTAUTH_URL=https://bluenote.site
GOOGLE_DRIVE_ENABLED=true  # Drive API 사용
```

### 3.2 Quiz Maker

```bash
# apps/quiz/.env.local
NEXTAUTH_URL=https://quiz.bluenote.site
GOOGLE_DRIVE_ENABLED=false  # Drive API 미사용
```

### 3.3 Grading System

```bash
# apps/grading/.env.local
NEXTAUTH_URL=https://grading.bluenote.site
GOOGLE_DRIVE_ENABLED=false  # Drive API 미사용
```

## 4. 일반적인 문제 해결

### 4.1 "Access blocked: This app's request is invalid" 오류

**원인**: Redirect URI 불일치

**해결 방법**:
1. 브라우저 개발자 도구에서 실제 redirect URI 확인
2. Google Console에서 정확히 일치하는 URI 추가
3. 변경사항 저장 후 5-10분 대기

### 4.2 "Error 400: redirect_uri_mismatch"

**원인**: 등록되지 않은 redirect URI 사용

**확인 사항**:
- `www` 포함/미포함 버전 모두 등록했는지 확인
- 포트 번호가 정확한지 확인 (개발 환경)
- 프로토콜이 정확한지 확인 (http vs https)

### 4.3 세션 공유 문제 (서브도메인 간)

**현재 제한사항**: NextAuth v4는 서브도메인 간 세션 공유를 완벽히 지원하지 않음

**권장 해결책**:
- 각 앱에서 독립적인 로그인 사용
- 향후 NextAuth v5 업그레이드 시 개선 예정

## 5. 보안 고려사항

### 5.1 환경 변수 관리

- **절대 하지 말 것**:
  - 환경 변수를 Git에 커밋
  - 클라이언트 사이드에서 시크릿 키 노출
  - 개발/프로덕션 환경에서 동일한 시크릿 사용

### 5.2 OAuth 스코프 최소화

- 필요한 최소한의 권한만 요청
- Web App: Drive API 필요
- Quiz/Grading: 기본 프로필 정보만 필요

### 5.3 정기적인 보안 점검

- [ ] 분기별 OAuth 클라이언트 시크릿 갱신
- [ ] 사용하지 않는 redirect URI 제거
- [ ] 접근 로그 모니터링

## 📚 관련 문서

- [NextAuth 구성 가이드](../apps/web/docs/NEXTAUTH_CONFIG.md)
- [환경 변수 설정 가이드](../apps/web/ENV_SETUP_GUIDE.md)
- [인증 개선 리포트](../apps/quiz/docs/authentication-improvement-report-v2.md)

## 🤝 지원

OAuth 설정 관련 문제가 있으시면:
- 이메일: support@bluenote.site
- 문서 업데이트 요청: GitHub Issues

---

*이 문서는 모든 Bluenote 앱의 Google OAuth 설정을 위한 통합 가이드입니다.*