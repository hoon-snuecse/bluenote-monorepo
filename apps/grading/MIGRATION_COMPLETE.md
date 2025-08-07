# Grading App - Supabase Auth 마이그레이션 완료

## 완료된 작업

### Phase 1-6: 완전 마이그레이션 ✅
1. **의존성 설치 및 환경 설정** - 완료
2. **Supabase Auth 클라이언트 설정** - 완료
3. **인증 미들웨어 마이그레이션** - 완료
4. **API 라우트 인증 로직 변경** - 완료
5. **클라이언트 컴포넌트 인증 훅 교체** - 완료
6. **NextAuth 제거 및 정리** - 완료

## 주요 변경사항

### 인증 시스템
- **Before**: NextAuth + Google OAuth
- **After**: Supabase Auth (이메일/비밀번호 + Google OAuth)

### 파일 변경 내역

#### 새로 생성된 파일
- `/src/lib/auth-helpers.ts` - Supabase Auth 헬퍼 함수
- `/src/lib/supabase-auth.ts` - Supabase 클라이언트 생성
- `/src/app/auth/callback/route.ts` - OAuth 콜백 처리
- `/src/types/supabase-auth.d.ts` - 타입 정의

#### 수정된 파일
- `/src/middleware.ts` - Supabase Auth 사용
- `/src/app/layout.tsx` - SupabaseAuthProvider 적용
- `/src/components/Providers.tsx` - Supabase Provider로 변경
- `/src/components/AuthLayout.tsx` - useSupabaseAuth 훅 사용
- `/src/contexts/UserContext.tsx` - Supabase Auth 통합
- 모든 API 라우트 - `getSessionWithPermissions()` 사용

#### 레거시 호환성
- `/src/lib/auth.ts` - 기존 코드 호환성을 위한 래퍼 유지

## 현재 인증 플로우

### 로그인 방식
1. **이메일/비밀번호 로그인**
   - `/auth/signin` 페이지에서 직접 로그인
   
2. **Google OAuth**
   - Google 계정으로 소셜 로그인
   - 콜백 URL: `/auth/callback`

3. **통합 인증**
   - Web 앱과 동일한 Supabase 인스턴스 사용
   - 세션 자동 동기화

### 권한 관리
- `user_permissions` 테이블에서 권한 정보 조회
- 역할: admin, teacher, user
- 권한: canWrite, canGrade

## 테스트 필요 항목

### 기능 테스트
- [ ] 이메일/비밀번호 로그인
- [ ] Google OAuth 로그인
- [ ] 로그아웃
- [ ] 세션 유지
- [ ] 권한 체크 (admin, teacher, user)

### API 테스트
- [ ] 과제 생성/조회/수정/삭제
- [ ] 제출물 생성/조회
- [ ] AI 채점 요청
- [ ] 권한별 접근 제한

### 통합 테스트
- [ ] Web 앱에서 로그인 후 Grading 앱 접근
- [ ] 세션 동기화 확인
- [ ] 권한 정보 공유 확인

## 남은 작업

1. **환경 변수 확인**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

2. **user_permissions 테이블 데이터 확인**
   - 기존 사용자 권한 마이그레이션
   - 새 사용자 기본 권한 설정

3. **프로덕션 배포**
   - Vercel 환경 변수 설정
   - 도메인 설정 확인

## 롤백 계획

만약 문제가 발생하면:
1. `git revert` 사용하여 이전 커밋으로 복구
2. NextAuth 관련 파일 복원
3. 환경 변수 원복

## 참고사항

- Supabase Auth는 자동으로 세션을 관리하고 토큰을 갱신합니다
- 쿠키 기반 세션으로 서버/클라이언트 간 동기화
- RLS는 비활성화 상태 (API 레벨에서 권한 체크)