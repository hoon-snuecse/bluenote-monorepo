# 사용자 권한 체계

## 권한 레벨

### 1. 관리자 (Admin)
- **역할**: `role = 'admin'`
- **권한**:
  - ✅ 관리자 대시보드 접근
  - ✅ 모든 콘텐츠 읽기/쓰기/수정/삭제
  - ✅ 사용자 관리
  - ✅ 시스템 설정 변경
  - ✅ Claude AI 무제한 사용
  - ✅ 프로그램 메뉴 사용

### 2. 일반 사용자 (User)
- **역할**: `role = 'user'`
- **권한**:
  - ❌ 관리자 대시보드 접근 불가
  - ✅ 모든 콘텐츠 읽기만 가능
  - ❌ 콘텐츠 작성/수정/삭제 불가
  - ✅ 프로그램 메뉴 사용 (글쓰기 평가 채점 시스템)
  - ✅ Claude AI 제한적 사용 (일일 한도)

## 권한 설정 방법

### SQL로 직접 설정
```sql
-- 관리자 권한 부여
UPDATE user_permissions 
SET role = 'admin', can_write = true, claude_daily_limit = 100
WHERE email = 'user@example.com';

-- 일반 사용자로 변경
UPDATE user_permissions 
SET role = 'user', can_write = false, claude_daily_limit = 10
WHERE email = 'user@example.com';
```

### 관리자 대시보드에서 설정
1. 관리자로 로그인
2. 관리자 대시보드 → 사용자 관리
3. 해당 사용자의 역할과 권한 수정

## 중요 사항

1. **ADMIN_EMAILS 환경변수는 더 이상 사용하지 않습니다**
   - 모든 권한은 `user_permissions` 테이블에서 관리됩니다
   - 하드코딩된 관리자 이메일은 모두 제거되었습니다

2. **기본 권한**
   - 새로운 사용자는 기본적으로 일반 사용자로 등록됩니다
   - 관리자가 명시적으로 권한을 부여해야 합니다

3. **권한 체크 위치**
   - `/middleware.js`: 페이지 접근 제한
   - `/lib/auth.js`: 인증 시 권한 확인
   - 각 API 라우트: 작업별 권한 확인