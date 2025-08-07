# Bluenote Monorepo 배포 가이드

## 1. 사전 준비 사항

### 필수 계정
- Vercel 계정
- Supabase 계정
- GitHub 계정 (코드 저장소)

### 환경 변수 준비
각 앱에 필요한 환경 변수를 준비합니다.

## 2. Supabase 데이터베이스 설정

### Step 1: Quiz 앱 권한 Migration 실행

1. Supabase 대시보드 접속
2. SQL Editor로 이동
3. 다음 migration 파일들을 순서대로 실행:

```bash
# Quiz 앱 migrations 폴더 위치
/apps/quiz/migrations/
```

실행 순서:
1. `01_create_quiz_tables.sql` - 테이블 생성 (이미 있으면 생략)
2. `02_add_rls_policies.sql` - RLS 정책 추가
3. `03_grant_authenticated_permissions.sql` - authenticated 역할 권한
4. **`04_grant_service_role_permissions.sql`** - service_role 권한 (중요!)

### Step 2: 권한 확인

SQL Editor에서 다음 쿼리로 권한 확인:

```sql
-- 권한 확인
SELECT 
    n.nspname as schema,
    c.relname as table,
    c.relacl as permissions
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
    AND n.nspname = 'public'
ORDER BY c.relname;
```

## 3. Vercel 배포

### Step 1: Vercel 프로젝트 연결

```bash
# 루트 디렉토리에서
npm install -g vercel
vercel login
```

### Step 2: 각 앱 배포 설정

#### Quiz 앱 배포

1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 연결
3. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/quiz`
   - **Build Command**: `cd ../.. && pnpm build --filter=quiz`
   - **Output Directory**: `apps/quiz/.next`
   - **Install Command**: `pnpm install`

4. 환경 변수 설정:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (필요한 경우)
NEXTAUTH_URL=https://your-quiz-app.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (필요한 경우)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Web 앱 배포

1. 새 프로젝트 생성
2. 프로젝트 설정:
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build --filter=web`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`

3. 환경 변수 설정:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=https://your-web-app.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Claude AI
ANTHROPIC_API_KEY=your-anthropic-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Grading 앱 배포

1. 새 프로젝트 생성
2. 프로젝트 설정:
   - **Root Directory**: `apps/grading`
   - **Build Command**: `cd ../.. && pnpm build --filter=grading`
   - **Output Directory**: `apps/grading/.next`
   - **Install Command**: `pnpm install`

3. 환경 변수 설정:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Prisma용)
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url

# NextAuth
NEXTAUTH_URL=https://your-grading-app.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Claude AI
ANTHROPIC_API_KEY=your-anthropic-key
```

### Step 3: 빌드 설정 최적화

각 프로젝트의 Vercel 설정에서:

1. **Node.js Version**: 20.x
2. **Package Manager**: pnpm
3. **Environment Variables**: Production 환경 변수 설정
4. **Build & Development Settings**:
   - Build Command Override 확인
   - Install Command Override 확인

## 4. 배포 실행

### 자동 배포 (권장)

GitHub main 브랜치에 푸시하면 자동 배포:

```bash
git add .
git commit -m "fix: 인증 시스템 통합 및 보안 패키지 추가"
git push origin main
```

### 수동 배포

각 앱 디렉토리에서:

```bash
# Quiz 앱
cd apps/quiz
vercel --prod

# Web 앱
cd apps/web
vercel --prod

# Grading 앱
cd apps/grading
vercel --prod
```

## 5. 배포 후 확인 사항

### 체크리스트

- [ ] Quiz 앱 접속 확인
  - [ ] 로그인 기능 동작
  - [ ] 퀴즈 생성/저장 기능
  - [ ] 커뮤니티 저장 기능 (권한 에러 없음)
  
- [ ] Web 앱 접속 확인
  - [ ] 로그인 기능 동작
  - [ ] 관리자 기능 확인
  - [ ] Claude AI 연동 확인
  
- [ ] Grading 앱 접속 확인
  - [ ] 로그인 기능 동작
  - [ ] 평가 기능 확인
  - [ ] API 보안 미들웨어 동작

### 문제 해결

#### 권한 에러 발생 시

1. Supabase SQL Editor에서 권한 재설정:
```sql
-- Service Role 권한 재부여
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

2. 환경 변수 확인:
- `SUPABASE_SERVICE_ROLE_KEY`가 올바르게 설정되었는지 확인
- Vercel 대시보드에서 환경 변수 재배포

#### 빌드 에러 발생 시

1. 로컬에서 빌드 테스트:
```bash
pnpm build --filter=quiz
pnpm build --filter=web
pnpm build --filter=grading
```

2. 의존성 확인:
```bash
pnpm install
pnpm update
```

## 6. 모니터링

### Vercel Analytics
- 각 앱의 성능 모니터링
- 에러 로그 확인
- 사용량 통계

### Supabase Dashboard
- 데이터베이스 쿼리 성능
- Auth 사용자 통계
- Storage 사용량

## 7. 롤백 절차

문제 발생 시 이전 버전으로 롤백:

1. Vercel 대시보드에서 Deployments 탭으로 이동
2. 이전 성공한 배포 선택
3. "Promote to Production" 클릭

## 8. 보안 권장사항

1. **환경 변수 관리**
   - 절대 코드에 직접 포함하지 않기
   - `.env.local` 파일은 `.gitignore`에 포함
   - Vercel 환경 변수 사용

2. **API 키 로테이션**
   - 정기적으로 API 키 갱신
   - Service Role Key는 특히 주의

3. **CORS 설정**
   - 프로덕션 도메인만 허용
   - 개발 환경과 프로덕션 환경 분리

## 완료!

모든 앱이 성공적으로 배포되면:
- Quiz 앱: https://your-quiz-app.vercel.app
- Web 앱: https://your-web-app.vercel.app
- Grading 앱: https://your-grading-app.vercel.app

각 URL에서 정상 동작을 확인하세요.