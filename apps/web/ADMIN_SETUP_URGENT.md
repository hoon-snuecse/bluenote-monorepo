# 🚨 긴급: 관리자 권한 설정

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