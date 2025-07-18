# 사용자 권한 업데이트 가이드

## Supabase에서 사용자 권한 확인 및 수정하기

### 1. Supabase 대시보드 접속
1. [Supabase](https://supabase.com) 접속 후 로그인
2. 해당 프로젝트 선택

### 2. Table Editor에서 권한 확인
1. 왼쪽 메뉴에서 "Table Editor" 클릭
2. `user_permissions` 테이블 선택
3. 문제가 되는 사용자의 이메일 찾기

### 3. 권한 수정
해당 사용자의 행에서:
- `can_write` 컬럼을 `true`로 변경
- `role`을 `admin`으로 변경 (관리자 권한이 필요한 경우)

### 4. SQL Editor를 통한 직접 수정 (대안)
왼쪽 메뉴에서 "SQL Editor" 클릭 후 다음 쿼리 실행:

```sql
-- 특정 사용자에게 글쓰기 권한 부여
UPDATE user_permissions 
SET can_write = true 
WHERE email = '사용자이메일@example.com';

-- 특정 사용자를 관리자로 설정
UPDATE user_permissions 
SET role = 'admin', can_write = true 
WHERE email = '사용자이메일@example.com';

-- 권한 확인
SELECT * FROM user_permissions 
WHERE email = '사용자이메일@example.com';
```

### 5. 세션 갱신
권한 수정 후:
1. 웹사이트에서 로그아웃
2. 다시 로그인
3. 연구 글쓰기 페이지에서 권한 정보 확인

### 문제 해결 체크리스트
- [ ] Supabase `user_permissions` 테이블에 해당 사용자 존재 확인
- [ ] `can_write` 값이 `true`인지 확인
- [ ] 로그아웃 후 재로그인 수행
- [ ] 브라우저 캐시 삭제 (필요시)