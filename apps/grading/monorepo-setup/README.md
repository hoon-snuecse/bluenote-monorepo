# BlueNote Monorepo

교육 도구와 콘텐츠를 제공하는 BlueNote 플랫폼의 모노레포입니다.

## 구조

```
bluenote-monorepo/
├── apps/
│   ├── web/           # 메인 웹사이트 (bluenote.site)
│   └── grading/       # 글쓰기 평가 시스템
├── packages/
│   ├── ui/            # 공통 UI 컴포넌트
│   ├── config/        # 공통 설정 (ESLint, TypeScript, Tailwind)
│   └── database/      # 데이터베이스 클라이언트 (Supabase)
```

## 시작하기

### 필수 요구사항

- Node.js 18+
- pnpm 9.13.2+

### 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### 개발

```bash
# 모든 앱 동시 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=web
pnpm dev --filter=grading
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 특정 앱만 빌드
pnpm build --filter=web
```

## 환경 변수

루트 디렉토리에 `.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Claude AI (선택사항)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## 배포

Vercel을 통한 모노레포 배포를 지원합니다.

1. Vercel에서 프로젝트 생성
2. Root Directory를 `apps/web` 또는 `apps/grading`으로 설정
3. Build Command는 자동으로 감지됩니다