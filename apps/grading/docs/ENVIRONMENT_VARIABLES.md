# 환경 변수 가이드

이 문서는 Bluenote Grading 시스템의 환경 변수 설정에 대한 가이드입니다.

## 목차

1. [필수 환경 변수](#필수-환경-변수)
2. [선택적 환경 변수](#선택적-환경-변수)
3. [환경별 설정](#환경별-설정)
4. [보안 가이드](#보안-가이드)
5. [문제 해결](#문제-해결)

## 필수 환경 변수

다음 환경 변수는 애플리케이션이 실행되기 위해 **반드시** 설정되어야 합니다:

### 데이터베이스

```bash
# PostgreSQL 연결 문자열 (Supabase)
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"

# Direct 연결 (Connection Pooling 우회)
DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
```

### 인증 및 보안

```bash
# JWT 토큰 서명용 시크릿 (최소 32자)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# 데이터 암호화 키 (32자)
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 프로덕션 환경 필수

프로덕션 환경에서는 다음 환경 변수도 필수입니다:

```bash
# NextAuth 설정
NEXTAUTH_URL="https://grading.bluenote.site"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
```

## 선택적 환경 변수

### AI 서비스

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI API (대체 옵션)
OPENAI_API_KEY="sk-..."
```

### Google OAuth (Google Drive 연동)

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 애플리케이션 설정

```bash
# 앱 URL과 이름
NEXT_PUBLIC_APP_URL="https://grading.bluenote.site"
NEXT_PUBLIC_APP_NAME="Bluenote Grading"

# API 속도 제한
RATE_LIMIT_WINDOW_MS="900000"      # 15분 (밀리초)
RATE_LIMIT_MAX_REQUESTS="100"      # 시간당 최대 요청 수

# 파일 업로드
MAX_FILE_SIZE="10485760"           # 10MB (바이트)
ALLOWED_FILE_TYPES="text/plain,application/pdf,..."
```

### 기능 플래그

```bash
# 기능 활성화/비활성화
ENABLE_AI_EVALUATION="true"
ENABLE_BATCH_EVALUATION="true"
ENABLE_PDF_EXPORT="true"
ENABLE_EXCEL_EXPORT="true"
ENABLE_SSE_UPDATES="true"

# 성능 최적화
ENABLE_CACHE="true"
CACHE_TTL_SECONDS="3600"           # 1시간
```

### 모니터링 (선택사항)

```bash
# Sentry 오류 추적
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="grading"

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

### 보안 설정

```bash
# CORS 허용 도메인
CORS_ORIGIN="https://grading.bluenote.site,https://bluenote.site"

# Content Security Policy
CSP_DIRECTIVES="default-src 'self'; ..."

# 유지보수 모드
MAINTENANCE_MODE="false"
```

## 환경별 설정

### 개발 환경 (.env.local)

```bash
NODE_ENV="development"
DATABASE_URL="postgresql://localhost:5432/grading_dev"
JWT_SECRET="dev-secret-key-not-for-production"
ENCRYPTION_KEY="dev-encryption-key-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
```

### 스테이징 환경 (.env.staging)

```bash
NODE_ENV="production"
DATABASE_URL="postgresql://staging-db-url..."
NEXTAUTH_URL="https://staging-grading.bluenote.site"
# 실제 API 키 사용하되, 사용량 제한 설정
```

### 프로덕션 환경 (.env.production)

```bash
NODE_ENV="production"
# 모든 실제 프로덕션 값 사용
# 보안 키는 안전하게 생성된 값 사용
```

## 보안 가이드

### 1. 시크릿 키 생성

```bash
# JWT_SECRET 생성
openssl rand -base64 32

# ENCRYPTION_KEY 생성 (정확히 32자)
openssl rand -hex 16

# NEXTAUTH_SECRET 생성
openssl rand -base64 32
```

### 2. 환경 변수 보안

- **.env 파일을 절대 Git에 커밋하지 마세요**
- 프로덕션 환경 변수는 안전한 방법으로 관리하세요:
  - Vercel 환경 변수
  - AWS Secrets Manager
  - HashiCorp Vault
  - 기타 보안 키 관리 서비스

### 3. 접근 제어

- 프로덕션 환경 변수는 필요한 인원만 접근 가능하도록 제한
- 정기적으로 키 로테이션 실시
- 환경 변수 접근 로그 모니터링

## 문제 해결

### 환경 변수 검증

앱 시작 시 환경 변수를 자동으로 검증합니다:

```typescript
// src/lib/env.ts에서 자동 검증
import { env } from '@/lib/env'
```

### 일반적인 오류

1. **"Missing required environment variables"**
   - 필수 환경 변수가 설정되지 않음
   - `.env.local` 파일 확인

2. **"Invalid DATABASE_URL"**
   - 데이터베이스 연결 문자열 형식 확인
   - 네트워크 연결 확인

3. **"NEXTAUTH_URL mismatch"**
   - 배포된 URL과 NEXTAUTH_URL이 일치하는지 확인
   - HTTPS 사용 확인

### 디버깅

환경 변수 정보 출력 (민감한 정보 제외):

```typescript
import { printEnvInfo } from '@/config'
printEnvInfo()
```

## 환경 변수 우선순위

1. 시스템 환경 변수
2. `.env.production` (프로덕션 모드)
3. `.env.local` (모든 환경)
4. `.env.development` (개발 모드)
5. `.env` (기본값)

## 배포 체크리스트

- [ ] 모든 필수 환경 변수 설정 확인
- [ ] 프로덕션용 시크릿 키 생성 및 설정
- [ ] 데이터베이스 연결 테스트
- [ ] AI API 키 유효성 확인
- [ ] CORS 및 보안 설정 확인
- [ ] 기능 플래그 설정 확인
- [ ] 모니터링 도구 연결 확인

## 참고 자료

- [Next.js 환경 변수](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase 환경 변수](https://supabase.com/docs/guides/hosting/overview)
- [NextAuth.js 설정](https://next-auth.js.org/configuration/options)