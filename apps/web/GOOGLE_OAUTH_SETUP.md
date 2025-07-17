# Google OAuth 설정 가이드

## 🔧 "Access blocked: This app's request is invalid" 오류 해결

### 1. Google Cloud Console 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials** 이동
4. OAuth 2.0 Client ID 찾기: `543723152833-uj87mua2k0329kvl1igtaqv8kd06tv16.apps.googleusercontent.com`

### 2. Authorized redirect URIs 설정

다음 URI들이 **모두** 등록되어 있어야 합니다:

```
https://bluenote.site/api/auth/callback/google
https://www.bluenote.site/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### 3. Authorized JavaScript origins 설정

다음 origin들이 등록되어 있어야 합니다:

```
https://bluenote.site
https://www.bluenote.site
http://localhost:3000
```

### 4. OAuth consent screen 확인

1. **OAuth consent screen** 메뉴 확인
2. **Publishing status**: Production으로 설정
3. **User type**: External 선택
4. **Test users**: 필요시 테스트 사용자 추가

### 5. 환경 변수 확인

`.env.local` 파일:
```bash
# Production 환경
NEXTAUTH_URL=https://bluenote.site

# 로컬 개발 시에는 다음으로 변경
# NEXTAUTH_URL=http://localhost:3000
```

### 6. 일반적인 오류 원인

1. **Redirect URI 불일치**: Google Console의 URI와 실제 사용 URI가 다름
2. **Protocol 불일치**: http vs https
3. **www 유무 차이**: www.bluenote.site vs bluenote.site
4. **Trailing slash**: /api/auth/callback/google vs /api/auth/callback/google/

### 7. 디버깅 방법

1. 브라우저 개발자 도구 → Network 탭
2. Google OAuth 요청의 redirect_uri 파라미터 확인
3. 해당 URI가 Google Console에 등록되어 있는지 확인

### 8. Vercel 배포 시 추가 설정

Vercel Dashboard에서 환경 변수 설정:
- `NEXTAUTH_URL`: https://bluenote.site (trailing slash 없이)
- 모든 환경 변수가 Production에 설정되어 있는지 확인