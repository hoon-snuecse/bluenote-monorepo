# Web App OAuth Setup Guide

## Google OAuth Redirect URI 설정

Web 앱이 Supabase Auth를 사용하도록 변경되었으므로, Google Cloud Console에서 OAuth redirect URI를 업데이트해야 합니다.

### 필요한 Redirect URIs

#### 개발 환경
- `http://localhost:3000/auth/callback` (NextAuth에서 Supabase로 변경됨)

#### 프로덕션 환경
- `https://www.bluenote.site/auth/callback`

### 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com/)에 로그인
2. 프로젝트 선택
3. APIs & Services > Credentials로 이동
4. OAuth 2.0 Client IDs에서 해당 클라이언트 선택
5. Authorized redirect URIs 섹션에서:
   - 기존 NextAuth URI들 제거:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://www.bluenote.site/api/auth/callback/google`
   - 새로운 Supabase URI들 추가:
     - `http://localhost:3000/auth/callback`
     - `https://www.bluenote.site/auth/callback`

### Supabase 프로젝트 설정

Web 앱용 Supabase 프로젝트 (ukxchcyvxnbmsfrsamjk)도 Google OAuth가 활성화되어 있는지 확인:

1. [Supabase Dashboard](https://app.supabase.com/project/ukxchcyvxnbmsfrsamjk/auth/providers)로 이동
2. Authentication > Providers > Google 확인
3. Google Provider가 활성화되어 있고 Client ID/Secret이 설정되어 있는지 확인

### 임시 해결 방법

Google Console 업데이트 전까지는 Supabase Dashboard의 OAuth redirect URI를 사용할 수 있습니다:

```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback`
  }
});
```

이 경우 Supabase가 자동으로 앱으로 리다이렉트합니다.