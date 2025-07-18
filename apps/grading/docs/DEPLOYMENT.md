# Bluenote Grading 배포 가이드

이 문서는 Bluenote Grading 시스템을 프로덕션 환경에 배포하는 과정을 안내합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [배포 프로세스](#배포-프로세스)
5. [배포 후 확인사항](#배포-후-확인사항)
6. [롤백 절차](#롤백-절차)
7. [모니터링 및 유지보수](#모니터링-및-유지보수)
8. [문제 해결](#문제-해결)

## 사전 준비사항

### 1. 시스템 요구사항

- Node.js 18.x 이상
- pnpm 8.x 이상
- PostgreSQL 14.x 이상 (Supabase 사용 시 자동 제공)
- 최소 2GB RAM, 20GB 디스크 공간

### 2. 필수 계정 및 서비스

- [ ] Supabase 계정 및 프로젝트
- [ ] Vercel 계정 (또는 다른 호스팅 서비스)
- [ ] Anthropic API 키 (Claude AI)
- [ ] Google OAuth 앱 (선택사항)
- [ ] 도메인 및 SSL 인증서

### 3. 로컬 환경 테스트

배포 전 로컬에서 프로덕션 빌드 테스트:

```bash
# 프로덕션 환경 변수 설정
cp .env.production.example .env.production
# 실제 값으로 수정

# 프로덕션 빌드
pnpm build --filter=grading

# 프로덕션 모드로 실행
pnpm start --filter=grading
```

## 환경 변수 설정

### 1. 환경 변수 파일 준비

```bash
# 프로덕션 환경 변수 템플릿 복사
cp apps/grading/.env.production.example apps/grading/.env.production
```

### 2. 필수 환경 변수 설정

#### 데이터베이스 (Supabase)
```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?schema=public"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?schema=public"
```

#### Supabase 설정
```bash
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
```

#### 인증 보안
```bash
# NextAuth 설정
NEXTAUTH_URL="https://grading.bluenote.site"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# JWT & 암호화 키
JWT_SECRET="$(openssl rand -base64 32)"
ENCRYPTION_KEY="$(openssl rand -hex 16)"
```

#### AI 서비스
```bash
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### 3. 환경 변수 검증

```bash
# 환경 변수 검증 스크립트 실행
cd apps/grading
node -e "require('./src/config').checkRequiredEnvVars()"
```

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 데이터베이스 연결 정보 확인
3. SQL Editor에서 필요한 확장 프로그램 활성화:

```sql
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto 확장 활성화 (암호화용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
cd apps/grading
pnpm prisma generate

# 데이터베이스 마이그레이션 실행
pnpm prisma migrate deploy

# 초기 데이터 시딩 (선택사항)
pnpm prisma db seed
```

### 3. 데이터베이스 백업 설정

Supabase Dashboard에서 자동 백업 활성화:
- Settings → Database → Backups
- Point-in-time Recovery 활성화 권장

## 배포 프로세스

### Vercel 배포 (권장)

#### 1. Vercel 프로젝트 설정

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
cd apps/grading
vercel link
```

#### 2. 환경 변수 설정

Vercel Dashboard에서 환경 변수 추가:
1. Project Settings → Environment Variables
2. 모든 프로덕션 환경 변수 추가
3. "Production" 환경 선택

#### 3. 배포 실행

```bash
# 프로덕션 배포
vercel --prod

# 또는 Git 통합 사용 시
git push origin main
```

### Docker 배포 (대안)

#### 1. Docker 이미지 빌드

```bash
# 루트 디렉토리에서
docker build -f apps/grading/Dockerfile -t grading-app .
```

#### 2. Docker Compose 설정

```yaml
# docker-compose.yml
version: '3.8'
services:
  grading:
    image: grading-app
    ports:
      - "3002:3002"
    env_file:
      - ./apps/grading/.env.production
    restart: unless-stopped
```

#### 3. 컨테이너 실행

```bash
docker-compose up -d
```

## 배포 후 확인사항

### 1. 헬스 체크

```bash
# API 상태 확인
curl https://grading.bluenote.site/api/health

# 응답 예시
# {"status":"ok","timestamp":"2024-01-15T10:00:00Z"}
```

### 2. 기능 테스트 체크리스트

- [ ] 로그인/로그아웃 동작 확인
- [ ] 과제 생성 및 조회
- [ ] 평가 기준 템플릿 CRUD
- [ ] AI 평가 실행
- [ ] 보고서 생성 및 다운로드
- [ ] 학생 그룹 관리

### 3. 성능 모니터링

- 페이지 로드 시간 < 3초
- API 응답 시간 < 500ms
- 에러율 < 1%

### 4. 보안 확인

```bash
# SSL 인증서 확인
openssl s_client -connect grading.bluenote.site:443 -servername grading.bluenote.site

# 보안 헤더 확인
curl -I https://grading.bluenote.site
```

## 롤백 절차

### 1. Vercel 롤백

```bash
# 이전 배포 목록 확인
vercel ls

# 특정 배포로 롤백
vercel rollback [deployment-url]
```

### 2. 데이터베이스 롤백

```bash
# 마이그레이션 히스토리 확인
pnpm prisma migrate status

# 이전 마이그레이션으로 롤백
pnpm prisma migrate resolve --rolled-back [migration-name]
```

### 3. 긴급 대응

1. 유지보수 모드 활성화:
   ```bash
   # Vercel 환경 변수에서
   MAINTENANCE_MODE=true
   ```

2. 트래픽 차단 (필요시):
   - CDN/로드밸런서에서 트래픽 차단
   - 또는 DNS 레코드 임시 변경

## 모니터링 및 유지보수

### 1. 로그 모니터링

Vercel Functions 로그:
```bash
vercel logs --follow
```

### 2. 에러 추적 (Sentry)

Sentry 설정 시:
- 실시간 에러 알림
- 성능 모니터링
- 사용자 세션 추적

### 3. 정기 유지보수

#### 주간 작업
- [ ] 로그 분석 및 에러 확인
- [ ] 성능 메트릭 검토
- [ ] 보안 업데이트 확인

#### 월간 작업
- [ ] 데이터베이스 백업 테스트
- [ ] 의존성 업데이트
- [ ] 보안 취약점 스캔

#### 분기별 작업
- [ ] 재해 복구 훈련
- [ ] 성능 최적화 검토
- [ ] 사용자 피드백 분석

## 문제 해결

### 1. 일반적인 문제

#### 데이터베이스 연결 실패
```bash
# 연결 테스트
pnpm prisma db pull

# 연결 문자열 확인
echo $DATABASE_URL | sed 's/:[^:]*@/:***@/'
```

#### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
pnpm build
```

#### 메모리 부족
```bash
# Node.js 메모리 증가
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### 2. 성능 문제

#### 느린 페이지 로드
- CDN 설정 확인
- 이미지 최적화 상태 확인
- 번들 크기 분석

#### API 타임아웃
- 데이터베이스 인덱스 확인
- Connection pooling 설정 검토
- AI API 응답 시간 모니터링

### 3. 보안 이슈

#### 의심스러운 활동
1. 로그 분석으로 패턴 확인
2. Rate limiting 강화
3. 필요시 특정 IP 차단

#### 데이터 유출 우려
1. 즉시 관련 API 키 재발급
2. 감사 로그 확인
3. 영향받은 사용자 통보

## 지원 및 연락처

### 기술 지원
- GitHub Issues: [grading-app/issues](https://github.com/bluenote/grading-app/issues)
- 이메일: support@bluenote.site

### 긴급 연락처
- 시스템 관리자: [연락처]
- 보안 담당자: [연락처]
- DBA: [연락처]

## 부록

### A. 배포 체크리스트

```markdown
## 배포 전
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과 (단위/통합/E2E)
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 준비
- [ ] 백업 확인

## 배포 중
- [ ] 유지보수 모드 활성화 (필요시)
- [ ] 배포 시작 공지
- [ ] 배포 진행
- [ ] 헬스 체크

## 배포 후
- [ ] 기능 테스트
- [ ] 성능 모니터링
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집
- [ ] 배포 완료 공지
```

### B. 유용한 스크립트

```bash
# 배포 상태 확인
#!/bin/bash
echo "Checking deployment status..."
curl -s https://grading.bluenote.site/api/health | jq '.'

# 데이터베이스 상태 확인
pnpm prisma migrate status

# 로그 tail
vercel logs --follow --limit=100
```