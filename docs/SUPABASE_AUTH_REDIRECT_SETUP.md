# Supabase Auth Redirect URL 설정 가이드

## 개요

Bluenote 모노레포의 여러 앱(Web, Quiz, Grading)이 하나의 Supabase 프로젝트를 공유하면서 각자의 도메인에서 인증을 처리하기 위한 설정 가이드입니다.

## 현재 구조

- **Web 앱**: https://bluenote.site (포트 3000)
- **Quiz 앱**: https://quiz.bluenote.site (포트 3003)
- **Grading 앱**: https://grading.bluenote.site (포트 3002)

## Supabase Dashboard 설정

### 1. Authentication > URL Configuration

#### Site URL
```
https://bluenote.site
```

**중요**: Site URL은 메인 도메인으로 유지합니다. 이는 이메일 템플릿과 기본 리디렉션에 사용됩니다.

#### Redirect URLs
다음 URL들을 모두 추가해야 합니다:

**프로덕션 URL:**
```
https://bluenote.site/auth/callback
https://quiz.bluenote.site/auth/callback
https://grading.bluenote.site/auth/callback
```

**개발 환경 URL:**
```
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
http://localhost:3003/auth/callback
```

### 2. Authentication > Providers > Google

Google OAuth가 활성화되어 있고, Client ID와 Client Secret이 올바르게 설정되어 있는지 확인합니다.

## 작동 원리

1. **Site URL의 역할**
   - 이메일 템플릿의 기본 URL (비밀번호 재설정, 이메일 확인 등)
   - OAuth 인증 후 기본 리디렉션 URL
   - 이메일 확인 링크의 기본 도메인

2. **Redirect URLs의 역할**
   - OAuth 인증 완료 후 실제 리디렉션이 허용되는 URL 목록
   - 각 앱이 자체 도메인으로 콜백을 받을 수 있도록 허용

3. **인증 플로우**
   ```
   사용자 로그인 클릭
   → Supabase Auth 페이지로 이동
   → Google OAuth 진행
   → Google에서 Supabase로 리턴
   → Supabase에서 해당 앱의 /auth/callback으로 리디렉트
   → 앱에서 세션 처리
   ```

## 장점

1. **통합 인증**: 모든 앱이 하나의 Supabase 프로젝트와 인증 시스템 공유
2. **독립적 운영**: 각 앱이 자체 도메인에서 독립적으로 작동
3. **유연성**: 새로운 앱 추가 시 Redirect URL만 추가하면 됨

## 주의사항

1. **Site URL 변경 금지**: Site URL을 특정 앱의 도메인으로 변경하면 다른 앱들의 이메일 기능에 영향을 줄 수 있습니다.

2. **Redirect URL 누락**: 각 앱의 Redirect URL이 누락되면 해당 앱에서 로그인 후 리디렉션 오류가 발생합니다.

3. **프로토콜 일치**: 개발 환경은 http://, 프로덕션은 https://를 사용해야 합니다.

## 문제 해결

### "Invalid Redirect URL" 오류
- Supabase Dashboard의 Redirect URLs에 해당 URL이 추가되어 있는지 확인
- URL에 오타가 없는지 확인 (특히 프로토콜과 포트 번호)

### 로그인 후 잘못된 앱으로 리디렉션
- 각 앱의 Supabase 클라이언트 설정에서 올바른 redirectTo URL을 지정했는지 확인
- Site URL이 아닌 Redirect URLs를 사용하고 있는지 확인

## 다음 단계

1. Supabase Dashboard에서 위의 Redirect URLs 모두 추가
2. 각 앱에서 Supabase Auth 구현 시 올바른 redirectTo 지정
3. 프로덕션 배포 후 각 도메인에서 로그인 테스트

## 참고

- [Supabase Auth URL Configuration 문서](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase OAuth 가이드](https://supabase.com/docs/guides/auth/social-login)