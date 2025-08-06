# Supabase Auth Setup for Web App

## 문제 해결

현재 OAuth 로그인 시 리다이렉트가 `https://ukxchcyvxnbmsfrsamjk.supabase.co`로 되는 문제가 있습니다. 
이를 해결하려면 Supabase 대시보드에서 다음 설정을 변경해야 합니다.

## Supabase Dashboard 설정

1. **Supabase Dashboard > Authentication > URL Configuration**

   ### Site URL
   ```
   https://bluenote.site
   ```
   **중요**: Site URL은 `https://bluenote.site`로 유지합니다. 
   - 이렇게 해야 quiz.bluenote.site, grading.bluenote.site 등 모든 서브도메인에서 정상 작동합니다
   - 각 앱은 코드에서 명시적으로 자신의 도메인으로 redirectTo를 설정합니다
   
   ### Redirect URLs (모든 URL 추가)
   ```
   https://www.bluenote.site/auth/callback
   https://bluenote.site/auth/callback
   https://quiz.bluenote.site/auth/callback
   https://grading.bluenote.site/auth/callback
   ```

2. **Google OAuth Provider 설정**
   - Authentication > Providers > Google
   - Client ID와 Client Secret이 올바르게 설정되어 있는지 확인
   - Authorized redirect URI가 위의 URL들을 포함하는지 확인

## Google Cloud Console 설정

1. **Google Cloud Console > APIs & Services > Credentials**
2. OAuth 2.0 Client ID 선택
3. **Authorized redirect URIs**에 다음 추가:
   ```
   https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback
   https://www.bluenote.site/auth/callback
   https://bluenote.site/auth/callback
   https://quiz.bluenote.site/auth/callback
   https://grading.bluenote.site/auth/callback
   ```

## 환경 변수 확인

`.env.local` 파일:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ukxchcyvxnbmsfrsamjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 디버그 방법

1. 콘솔에서 OAuth URL 확인:
   ```javascript
   // 브라우저 콘솔에서 실행
   const supabase = createBrowserClient();
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/auth/callback`,
       skipBrowserRedirect: true
     }
   });
   console.log('OAuth URL:', data.url);
   ```

2. 클라이언트 디버그 페이지 방문:
   ```
   https://www.bluenote.site/auth/client-debug
   ```

## 주의사항

- Supabase의 Site URL은 **정확히** `https://www.bluenote.site`로 설정해야 합니다 (www 포함)
- Redirect URLs에는 모든 가능한 도메인 변형을 포함해야 합니다
- Google Cloud Console과 Supabase 양쪽 모두에서 redirect URI를 설정해야 합니다