# Supabase Auth 디버깅 체크리스트

## 1. Supabase Dashboard 설정 확인

### Authentication > Providers > Google
1. **Enabled**: ON으로 설정되어 있는지 확인
2. **Client ID**: Google Cloud Console에서 복사한 Client ID
3. **Client Secret**: Google Cloud Console에서 복사한 Client Secret
4. **Authorized Client IDs**: 비어있거나 위 Client ID가 있어야 함

### Authentication > URL Configuration
1. **Site URL**: `https://bluenote.site`
2. **Redirect URLs**에 다음이 모두 포함되어 있어야 함:
   ```
   https://bluenote.site/auth/callback
   https://quiz.bluenote.site/auth/callback
   https://grading.bluenote.site/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3002/auth/callback
   http://localhost:3003/auth/callback
   ```

### Authentication > Settings
1. **JWT Expiry Limit**: 3600 (1시간) 이상
2. **Enable Email Confirmations**: OFF (테스트 중에는)
3. **Enable Manual Linking**: ON

## 2. 테스트 순서

1. 브라우저 캐시/쿠키 완전 삭제
2. 시크릿 모드로 https://quiz.bluenote.site/debug-auth 접속
3. "Test Google OAuth" 클릭
4. Google 로그인
5. 리다이렉트 후 "Check Session" 클릭
6. 로그 확인

## 3. 예상되는 정상 플로우

1. quiz.bluenote.site에서 OAuth 시작
2. accounts.google.com으로 이동
3. ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback으로 리턴
4. quiz.bluenote.site/auth/callback으로 리다이렉트
5. 세션 생성 완료

## 4. 문제 해결

### "Auth session missing" 에러가 계속 발생하는 경우:

1. **Supabase Dashboard > Authentication > Users** 확인
   - 로그인 시도 후 새 사용자가 생성되었는지 확인
   - 생성되지 않았다면 OAuth 설정 문제

2. **브라우저 개발자 도구 > Network 탭**에서 확인:
   - `https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback` 요청 확인
   - 응답 상태 코드와 리다이렉트 위치 확인

3. **쿠키 확인**:
   - `sb-ukxchcyvxnbmsfrsamjk-auth-token` 쿠키가 있는지
   - Domain이 `.bluenote.site`로 설정되어 있는지

## 5. 임시 해결책 (테스트용)

만약 계속 문제가 발생한다면, Supabase Email/Password 인증으로 테스트:

```javascript
// 이메일/패스워드로 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
})

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'testpassword123'
})
```

이 방법으로 세션이 생성된다면 OAuth 설정 문제임이 확실함.