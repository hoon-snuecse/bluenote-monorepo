# Supabase Redirect URLs 설정 가이드

## 문제 상황
- Supabase Site URL이 `https://bluenote.site`로 설정되어 있음
- OAuth 후 모든 앱이 `www.bluenote.site`로 리다이렉트됨
- 각 서브도메인 앱에서 로그인이 제대로 작동하지 않음

## 해결 방법

### Supabase Dashboard에서 설정해야 할 것들:

1. **Authentication > URL Configuration**으로 이동

2. **Site URL** (변경하지 않음)
   ```
   https://bluenote.site
   ```

3. **Redirect URLs**에 다음 URL들을 모두 추가:
   ```
   https://bluenote.site/auth/callback
   https://www.bluenote.site/auth/callback
   https://quiz.bluenote.site/auth/callback
   https://grading.bluenote.site/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   http://localhost:3002/auth/callback
   http://localhost:3003/auth/callback
   ```

   또는 와일드카드 사용 (Supabase가 지원하는 경우):
   ```
   https://*.bluenote.site/auth/callback
   http://localhost:*/auth/callback
   ```

4. **저장** 버튼 클릭

## 테스트 방법

1. Supabase Dashboard에서 Redirect URLs 설정 추가
2. 5분 정도 대기 (설정 반영 시간)
3. https://quiz.bluenote.site/auth-test 에서 테스트

## 대안 (Redirect URLs가 작동하지 않는 경우)

1. **Direct Google OAuth 사용**
   - `/auth/google-direct` route 사용
   - Supabase OAuth를 우회하고 직접 Google 인증
   - 인증 후 Supabase 세션 수동 생성

2. **프록시 방식**
   - www.bluenote.site에서 인증 처리
   - 각 앱으로 토큰 전달

## 권장사항

Redirect URLs를 먼저 설정해보고, 작동하지 않으면 Direct Google OAuth 방식을 사용하는 것을 권장합니다.