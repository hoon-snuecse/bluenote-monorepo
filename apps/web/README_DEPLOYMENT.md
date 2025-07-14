# BlueNote Atelier 배포 가이드

## 개요
이 문서는 BlueNote Atelier 웹사이트를 배포하는 방법을 설명합니다.

## 필수 요구사항
- Node.js 18.17 이상
- Supabase 계정
- Google Cloud Console 계정 (OAuth용)
- Anthropic API 키
- Vercel 계정 (권장) 또는 다른 호스팅 서비스

## 1. Supabase 설정

### 1.1 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 Anon Key 저장

### 1.2 데이터베이스 마이그레이션
SQL Editor에서 다음 순서로 마이그레이션 실행:

```sql
-- 1. 기본 테이블 생성
supabase/migrations/01_create_shed_tables.sql
supabase/migrations/02_create_research_tables.sql
supabase/migrations/03_create_research_files_table.sql
supabase/migrations/04_create_shed_files_table.sql
supabase/migrations/05_create_teaching_tables.sql
supabase/migrations/06_create_analytics_tables.sql

-- 2. 보안 수정
supabase/migrations/07_fix_search_path_security.sql
supabase/migrations/08_add_missing_triggers.sql

-- 3. 사용자 권한 시스템
supabase/migrations/09_create_user_permissions.sql
```

### 1.3 Storage 버킷 생성
Storage 섹션에서 다음 버킷 생성:
- `research-images` (public)
- `teaching-images` (public)
- `analytics-images` (public)
- `shed-images` (public)

## 2. Google OAuth 설정

### 2.1 Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services > Credentials로 이동
4. "Create Credentials" > "OAuth client ID" 선택
5. Application type: "Web application" 선택
6. Authorized redirect URIs 추가:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://yourdomain.com/api/auth/callback/google`
7. Client ID와 Client Secret 저장

## 3. 환경 변수 설정

### 3.1 로컬 개발
`.env.local` 파일 생성:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[openssl rand -base64 32 명령으로 생성]

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3.2 Vercel 배포
Vercel Dashboard > Settings > Environment Variables에서 설정:
- 모든 환경 변수를 Production, Preview, Development에 추가
- `NEXTAUTH_URL`은 프로덕션 도메인으로 변경

## 4. 배포

### 4.1 Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서
cd my-claude-app
vercel

# 프롬프트 따라 진행
```

### 4.2 수동 배포
```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 5. 배포 후 설정

### 5.1 첫 관리자 설정
1. Supabase SQL Editor에서 관리자 추가:
```sql
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('your-email@domain.com', 'admin', 999999, true);
```

### 5.2 Google OAuth 리다이렉트 URI 업데이트
Google Cloud Console에서 프로덕션 도메인 추가:
- `https://yourdomain.com/api/auth/callback/google`

### 5.3 도메인 설정
- Vercel Dashboard에서 커스텀 도메인 추가
- DNS 설정 업데이트

## 6. 보안 체크리스트

- [ ] 모든 환경 변수가 프로덕션 값으로 설정됨
- [ ] `NEXTAUTH_SECRET`이 안전한 랜덤 값으로 설정됨
- [ ] Supabase RLS 정책이 활성화됨
- [ ] Google OAuth 리다이렉트 URI가 올바르게 설정됨
- [ ] HTTPS가 활성화됨 (Vercel은 자동)
- [ ] 관리자 이메일이 올바르게 설정됨

## 7. 모니터링

### 7.1 에러 확인
- Vercel Dashboard > Functions 탭에서 로그 확인
- Supabase Dashboard에서 데이터베이스 로그 확인

### 7.2 사용량 모니터링
- 관리자 대시보드 (`/admin/dashboard`)에서 사용 통계 확인
- Anthropic Console에서 API 사용량 확인
- Supabase Dashboard에서 데이터베이스 사용량 확인

## 8. 문제 해결

### 로그인이 안 되는 경우
1. Google OAuth 설정 확인
2. 리다이렉트 URI 확인
3. 환경 변수 확인

### Claude API가 작동하지 않는 경우
1. API 키 확인
2. 사용량 한도 확인
3. 네트워크 연결 확인

### 파일 업로드가 안 되는 경우
1. Supabase Storage 버킷 권한 확인
2. 파일 크기 제한 확인
3. CORS 설정 확인

## 9. 업데이트

### 코드 업데이트
```bash
git pull origin main
npm install
npm run build
# Vercel은 자동 배포
```

### 데이터베이스 마이그레이션
새로운 마이그레이션 파일이 있는 경우 Supabase SQL Editor에서 실행

## 10. 백업

### 데이터베이스 백업
- Supabase Dashboard > Database > Backups에서 자동 백업 확인
- 수동 백업: pg_dump 사용

### 파일 백업
- Supabase Storage의 파일들을 정기적으로 백업
- 로컬 백업 스크립트 작성 권장

---

추가 도움이 필요하면 [hoon@snuecse.org](mailto:hoon@snuecse.org)로 연락주세요.