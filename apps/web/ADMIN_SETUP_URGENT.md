# 🚨 관리자 권한 설정 및 대시보드 수정 이력

## 📝 최근 수정 내역 (2025-08-17)

### 관리자 대시보드 주요 수정사항

#### 1. **데이터 연결 문제 해결**
- ✅ 통합 인증 구현 후 대시보드에 데이터가 표시되지 않던 문제 해결
- ✅ `usage_logs` 테이블에서 실제 로그인 데이터 연결 (770+ 로그인 기록)
- ✅ `Evaluation` 테이블에서 채점 통계 연결 (93개 레코드: Sonnet 63개, Opus 30개)
- ✅ 사용자 목록, 분석, 콘텐츠 관리 페이지 데이터 표시 정상화

#### 2. **API 응답 오류 수정**
- ✅ `NextResponse.json()` 대신 `Response.json()` 사용하여 404 오류 해결
- ✅ 필드 매핑 문제 해결 (`user_email` vs `email`)
- ✅ React hydration 오류 해결

#### 3. **ESLint 오류 정리**
- ✅ `react-hooks/exhaustive-deps` 경고 수정
- ✅ `useCallback`으로 fetch 함수 래핑 및 적절한 의존성 추가
- ✅ Vercel 배포를 위한 코드 정리

#### 4. **AI Chat 로그인 루프 문제 해결**
- ✅ `/ai/chat` 페이지의 무한 로그인 루프 수정
- ✅ `session-check` API의 `createServerClient` 호출 수정
- ✅ `useSupabaseAuth` 훅 직접 사용으로 변경
- ✅ 리디렉션 경로 `/login`에서 홈으로 변경

#### 5. **Claude 모델 선택 기능 강화**
- ✅ Claude Opus 4.1 (claude-opus-4-1-20250805) 추가
- ✅ Claude Sonnet 4 (claude-sonnet-4-20250514) 추가
- ✅ 총 5개 모델 선택 가능
- ✅ 모델별 max_tokens 최적화 (Opus 4.1: 8192, Sonnet 4: 4096)
- ✅ 모델별 배지 및 설명 UI 개선
- ✅ API 오류 체크 및 상세 로깅 추가

#### 6. **데이터베이스 권한 문제**
- ⚠️ `Evaluation` 테이블 RLS 권한 오류 (코드 42501) 에러 핸들링 추가
- ⚠️ Service Role Key가 RLS를 우회하지 못하는 문제 (Supabase 대시보드에서 수정 필요)

---

## 초기 설정 가이드

현재 `hoon@snuecse.org` 계정에 권한이 없어 글을 작성/수정할 수 없습니다.

## 즉시 실행 필요한 단계:

### 1. Supabase 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택

### 2. SQL Editor에서 다음 명령 실행
왼쪽 메뉴에서 **SQL Editor** 클릭 후, 다음 SQL 전체를 복사하여 실행:

```sql
-- hoon@snuecse.org에 관리자 권한 부여
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES (
    'hoon@snuecse.org',
    'admin',
    true,
    100,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    can_write = true,
    updated_at = NOW();
```

### 3. 실행 후 확인
같은 SQL Editor에서:
```sql
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';
```

결과가 다음과 같이 나와야 합니다:
- role: `admin`
- can_write: `true`

### 4. 웹사이트에서 확인
1. 로그아웃
2. 다시 로그인
3. 연구 글쓰기 페이지(`/research/write`)에서 확인:
   - 관리자 권한: **예**
   - 글쓰기 권한: **예**

## 추가 사용자 권한 부여
다른 사용자에게 글쓰기 권한만 부여하려면:
```sql
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES ('사용자이메일@example.com', 'user', true, 50, NOW(), NOW());
```

## 문제가 지속되면
1. 브라우저 쿠키/캐시 삭제
2. 시크릿 창에서 재시도
3. 환경변수 `ADMIN_EMAILS`에 `hoon@snuecse.org` 포함 확인