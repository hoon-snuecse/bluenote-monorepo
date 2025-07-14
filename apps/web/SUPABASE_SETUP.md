# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 에 접속하여 계정을 생성합니다.
2. "New project" 버튼을 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름과 데이터베이스 비밀번호를 설정합니다.
4. 지역은 "Northeast Asia (Seoul)"을 선택하는 것을 권장합니다.

## 2. 데이터베이스 설정

Supabase 대시보드에서 SQL Editor로 이동하여 다음 파일들의 내용을 순서대로 실행합니다:

1. `/supabase/migrations/01_create_shed_tables.sql` - 테이블 생성
2. `/supabase/migrations/02_create_storage_bucket.sql` - Storage 버킷 생성

## 3. 환경 변수 설정

### Supabase에서 키 찾기:
1. Supabase 대시보드 > Settings > API
2. Project URL과 anon public key를 복사

### .env.local 파일에 추가:
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel 환경 변수 설정 (배포 시):
1. Vercel 대시보드 > Settings > Environment Variables
2. 위의 두 환경 변수를 추가

## 4. 애플리케이션 설정

### 개발 환경에서 테스트:
```bash
npm run dev
```

### API 엔드포인트 변경:
- 기존: `/api/shed/posts`
- 신규: `/api/shed/posts/supabase`

페이지에서 사용하는 API 엔드포인트를 변경해야 합니다:
- `/app/shed/page.js`
- `/app/shed/[id]/page.js`
- `/app/shed/write/page.js` → `SupabaseWritePage.js` 사용

## 5. 마이그레이션

### 기존 데이터가 있는 경우:
1. 로컬 `data/shed-posts.json` 파일의 데이터를 수동으로 이전
2. Supabase 대시보드의 Table Editor를 사용하거나
3. 마이그레이션 스크립트 작성 (선택사항)

## 6. Storage 정책

- 최대 파일 크기: 10MB
- 지원 형식: JPEG, PNG, GIF, WebP
- 공개 읽기 권한 설정됨
- CDN을 통한 이미지 제공

## 7. 문제 해결

### CORS 오류:
- Supabase 대시보드 > Authentication > URL Configuration
- Site URL에 로컬 및 프로덕션 URL 추가

### Storage 업로드 실패:
- 파일 크기 확인 (10MB 제한)
- MIME 타입 확인
- Storage 정책 확인

### 데이터베이스 연결 실패:
- 환경 변수 확인
- Supabase 프로젝트 상태 확인
- API 키 권한 확인