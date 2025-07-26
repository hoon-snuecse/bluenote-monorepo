# FILE_STRUCTURE_GUIDE.md

프로젝트의 구조와 파일들의 관계를 쉽게 이해하고 필요한 파일을 빠르게 찾을 수 있는 가이드입니다.

## 1. 프로젝트 구조 트리

```
bluenote-monorepo/
├── 📁 apps/                              # 독립적인 애플리케이션들
│   ├── 📁 web/                          # 메인 교육 웹사이트 (JavaScript)
│   │   ├── 📁 app/                      # Next.js App Router
│   │   │   ├── 📁 admin/                # 관리자 전용 페이지들
│   │   │   │   ├── 📁 analytics/        # 통계 및 분석 대시보드
│   │   │   │   ├── 📁 content/          # 콘텐츠 관리
│   │   │   │   ├── 📁 users/            # 사용자 관리
│   │   │   │   └── 📄 layout.js         # 관리자 레이아웃
│   │   │   ├── 📁 api/                  # API 엔드포인트들
│   │   │   │   ├── 📁 admin/            # 관리자 API
│   │   │   │   ├── 📁 auth/             # 인증 관련 API
│   │   │   │   ├── 📁 claude/           # Claude AI API
│   │   │   │   └── 📁 [section]/        # 각 섹션별 CRUD API
│   │   │   ├── 📁 research/             # 연구 콘텐츠 페이지
│   │   │   ├── 📁 teaching/             # 교육 콘텐츠 페이지
│   │   │   ├── 📁 analytics/            # 분석 콘텐츠 페이지
│   │   │   ├── 📁 shed/                 # 일상 콘텐츠 페이지
│   │   │   ├── 📁 ai/chat/              # AI 채팅 인터페이스
│   │   │   ├── 📄 layout.js             # 앱 전체 레이아웃
│   │   │   └── 📄 page.js               # 홈페이지
│   │   ├── 📁 components/               # 재사용 컴포넌트
│   │   │   ├── 📄 Navigation.js         # 네비게이션 바
│   │   │   ├── 📄 Footer.js             # 푸터
│   │   │   └── 📄 Providers.js          # Context Providers
│   │   ├── 📁 lib/                      # 유틸리티 및 설정
│   │   │   ├── 📄 auth.js               # NextAuth 설정
│   │   │   ├── 📄 supabase.js           # Supabase 클라이언트
│   │   │   └── 📄 api-config.js         # API 설정
│   │   └── 📄 package.json              # 의존성 관리
│   │
│   └── 📁 grading/                      # AI 작문 평가 시스템 (TypeScript)
│       ├── 📁 src/
│       │   ├── 📁 app/                  # Next.js App Router
│       │   │   ├── 📁 api/              # API 엔드포인트
│       │   │   │   ├── 📁 assignments/  # 과제 관리 API
│       │   │   │   ├── 📁 evaluations/  # 평가 관리 API
│       │   │   │   └── 📁 stats/        # 통계 API
│       │   │   ├── 📁 assignments/      # 과제 관련 페이지
│       │   │   ├── 📁 dashboard/        # 대시보드 페이지
│       │   │   └── 📄 page.tsx          # 메인 페이지
│       │   ├── 📁 components/           # UI 컴포넌트
│       │   ├── 📁 lib/                  # 비즈니스 로직
│       │   │   ├── 📄 prisma.ts         # Prisma 클라이언트
│       │   │   ├── 📄 auth.ts           # 인증 설정
│       │   │   └── 📄 claude-api.ts     # Claude AI 통합
│       │   └── 📁 types/                # TypeScript 타입 정의
│       └── 📁 prisma/                   # 데이터베이스 스키마
│           └── 📄 schema.prisma         # Prisma 스키마 정의
│
├── 📁 packages/                         # 공유 패키지들
│   ├── 📁 ui/                          # 공통 UI 컴포넌트
│   ├── 📁 auth/                        # 공통 인증 로직
│   ├── 📁 config/                      # 공통 설정 파일들
│   └── 📁 shared-infra/                # 공유 인프라 코드
│
├── 📄 turbo.json                       # Turborepo 빌드 설정
├── 📄 pnpm-workspace.yaml              # pnpm 워크스페이스 설정
├── 📄 vercel.json                      # Vercel 배포 설정
└── 📄 package.json                     # 루트 패키지 설정
```

## 2. 핵심 파일 상세 분석

### 파일명: `apps/web/lib/auth.js`
- **역할**: NextAuth 인증 시스템 설정 및 관리
- **주요 기능**: 
  - Google OAuth 설정
  - 사용자 권한 확인 (allowlist 기반)
  - 로그인 활동 추적
  - 세션 관리
- **연관 파일**: 
  - `apps/web/app/api/auth/[...nextauth]/route.js`
  - `apps/web/middleware.js`
  - `packages/auth/src/authOptions.ts`
- **수정 시 영향**: 모든 인증이 필요한 페이지와 API
- **찾는 법**: 로그인/로그아웃 로직 변경, 권한 시스템 수정 시

### 파일명: `apps/web/app/admin/analytics/AdminAnalyticsClient.js`
- **역할**: 관리자 대시보드의 통계 화면 구현
- **주요 기능**: 
  - 사용자별 활동 상태 표시
  - AI 사용량 통계 표시
  - 콘텐츠 통계 차트
- **연관 파일**: 
  - `apps/web/app/api/admin/stats/route.js`
  - `apps/web/app/api/admin/user-activity/route.js`
  - `apps/web/app/api/admin/grading-stats/route.js`
- **수정 시 영향**: 관리자 대시보드 통계 화면
- **찾는 법**: 관리자 통계 UI 변경, 새로운 통계 추가 시

### 파일명: `apps/grading/src/lib/claude-api.ts`
- **역할**: Claude AI API 통합 및 평가 로직
- **주요 기능**: 
  - AI 평가 요청 처리
  - 평가 기준 템플릿 관리
  - 스트리밍 응답 처리
- **연관 파일**: 
  - `apps/grading/src/app/api/evaluations/route.ts`
  - `apps/grading/src/lib/ai-evaluator.ts`
- **수정 시 영향**: 모든 AI 평가 기능
- **찾는 법**: AI 평가 로직 변경, 새 모델 추가 시

### 파일명: `apps/grading/prisma/schema.prisma`
- **역할**: Grading 앱의 데이터베이스 스키마 정의
- **주요 기능**: 
  - 테이블 구조 정의
  - 관계 설정
  - 인덱스 정의
- **연관 파일**: 
  - `apps/grading/src/lib/prisma.ts`
  - 모든 데이터베이스 접근 코드
- **수정 시 영향**: 데이터베이스 구조, 마이그레이션 필요
- **찾는 법**: 새 테이블 추가, 필드 변경 시

### 파일명: `apps/web/lib/supabase.js`
- **역할**: Supabase 클라이언트 초기화 및 헬퍼 함수
- **주요 기능**: 
  - 클라이언트/서버/관리자 클라이언트 생성
  - 파일 업로드 헬퍼
  - 데이터베이스 쿼리 헬퍼
- **연관 파일**: 
  - 모든 Supabase를 사용하는 API 라우트
  - `apps/web/lib/supabase/client.js`
  - `apps/web/lib/supabase/server.js`
- **수정 시 영향**: 모든 데이터베이스 접근 코드
- **찾는 법**: 데이터베이스 연결 설정 변경 시

### 파일명: `turbo.json`
- **역할**: Turborepo 빌드 파이프라인 설정
- **주요 기능**: 
  - 빌드 순서 정의
  - 캐싱 전략 설정
  - 환경 변수 관리
- **연관 파일**: 
  - `package.json` (스크립트)
  - 각 앱의 `package.json`
- **수정 시 영향**: 빌드 프로세스, 개발 서버
- **찾는 법**: 빌드 설정 변경, 새 환경변수 추가 시

### 파일명: `apps/web/middleware.js`
- **역할**: Next.js 미들웨어로 인증 및 라우팅 제어
- **주요 기능**: 
  - 보호된 경로 접근 제어
  - 세션 확인
  - 리다이렉션 처리
- **연관 파일**: 
  - `apps/web/lib/auth.js`
  - 모든 보호된 페이지
- **수정 시 영향**: 페이지 접근 권한
- **찾는 법**: 새 보호 경로 추가, 권한 로직 변경 시

### 파일명: `apps/grading/src/app/api/stats/users/route.ts`
- **역할**: 사용자별 AI 평가 통계 API
- **주요 기능**: 
  - 모델별 사용자 통계 집계
  - 최다 사용자 랭킹
- **연관 파일**: 
  - `apps/web/app/api/admin/grading-user-stats/route.js`
  - `apps/grading/prisma/schema.prisma`
- **수정 시 영향**: 관리자 대시보드 사용자 통계
- **찾는 법**: AI 사용 통계 수정 시

### 파일명: `apps/web/app/api/claude/route.js`
- **역할**: Claude AI 채팅 API 엔드포인트
- **주요 기능**: 
  - 채팅 요청 처리
  - 사용량 제한 확인
  - 응답 스트리밍
- **연관 파일**: 
  - `apps/web/app/ai/chat/ClaudeChat.js`
  - `apps/web/lib/usage.js`
- **수정 시 영향**: AI 채팅 기능
- **찾는 법**: AI 채팅 로직 변경 시

### 파일명: `packages/auth/src/authOptions.ts`
- **역할**: 공통 NextAuth 설정 팩토리 함수
- **주요 기능**: 
  - 앱별 인증 설정 생성
  - 콜백 함수 정의
  - 세션 전략 설정
- **연관 파일**: 
  - `apps/web/lib/auth.js`
  - `apps/grading/src/lib/auth.ts`
- **수정 시 영향**: 모든 앱의 인증 시스템
- **찾는 법**: 인증 로직 전체 변경 시

## 3. 기능별 파일 그룹

### 🎯 사용자 인증 및 권한 관리
- **관련 파일들**:
  - `apps/web/lib/auth.js` - NextAuth 설정
  - `apps/web/middleware.js` - 라우트 보호
  - `apps/web/app/api/auth/[...nextauth]/route.js` - 인증 API
  - `packages/auth/src/authOptions.ts` - 공통 인증 옵션
- **시작점**: `apps/web/lib/auth.js`부터 시작
- **수정 시나리오**: 
  - 새 OAuth 제공자 추가
  - 권한 레벨 변경
  - 세션 시간 조정

### 🎯 AI 작문 평가
- **관련 파일들**:
  - `apps/grading/src/lib/claude-api.ts` - AI API 통합
  - `apps/grading/src/app/api/evaluations/route.ts` - 평가 API
  - `apps/grading/src/components/evaluation/*` - 평가 UI
  - `apps/grading/prisma/schema.prisma` - 데이터 모델
- **시작점**: `apps/grading/src/app/assignments/[assignmentId]/evaluate/page.tsx`
- **수정 시나리오**: 
  - 평가 기준 변경
  - 새 AI 모델 추가
  - 평가 UI 개선

### 🎯 관리자 대시보드
- **관련 파일들**:
  - `apps/web/app/admin/analytics/AdminAnalyticsClient.js` - 통계 UI
  - `apps/web/app/api/admin/stats/route.js` - 통계 API
  - `apps/web/app/api/admin/user-activity/route.js` - 활동 API
  - `apps/web/app/admin/users/AdminUsersClient.js` - 사용자 관리
- **시작점**: `apps/web/app/admin/dashboard/page.js`
- **수정 시나리오**: 
  - 새 통계 지표 추가
  - 사용자 관리 기능 추가
  - 대시보드 레이아웃 변경

### 🎯 콘텐츠 관리 (CMS)
- **관련 파일들**:
  - `apps/web/app/[section]/page.js` - 목록 페이지
  - `apps/web/app/[section]/[id]/page.js` - 상세 페이지
  - `apps/web/app/[section]/write/page.js` - 작성 페이지
  - `apps/web/app/api/[section]/posts/route.js` - CRUD API
- **시작점**: 해당 섹션의 `page.js`
- **수정 시나리오**: 
  - 새 콘텐츠 타입 추가
  - 편집기 기능 개선
  - 파일 업로드 로직 변경

### 🎯 크로스 앱 통신
- **관련 파일들**:
  - `apps/web/app/api/admin/grading-stats/route.js` - 프록시 API
  - `apps/grading/src/app/api/stats/route.ts` - 원본 API
  - 각 앱의 CORS 설정 파일
- **시작점**: 프록시 API 파일들
- **수정 시나리오**: 
  - 새 크로스 앱 API 추가
  - CORS 정책 변경
  - API 응답 형식 변경

## 4. 파일 의존성 맵

```
apps/web/app/layout.js
├── imports components/Providers.js
│   ├── imports NextAuth SessionProvider
│   └── imports Custom Contexts
├── imports components/Navigation.js
│   └── imports lib/auth.js (session check)
└── imports globals.css

apps/web/app/admin/analytics/page.js
├── imports AdminAnalyticsClient.js
│   ├── calls /api/admin/stats
│   ├── calls /api/admin/user-activity
│   └── calls /api/admin/grading-stats
│       └── proxies to grading app

apps/grading/src/app/page.tsx
├── imports components/Navigation.tsx
├── imports lib/auth.ts
└── imports lib/prisma.ts

packages/auth/src/authOptions.ts
├── used by apps/web/lib/auth.js
└── used by apps/grading/src/lib/auth.ts
```

## 5. 빠른 찾기 가이드

### 🔍 "이런 작업을 하고 싶다면..."

- **새로운 페이지 추가**: 
  - Web 앱: `apps/web/app/` 아래에 폴더 생성 후 `page.js` 추가
  - Grading 앱: `apps/grading/src/app/` 아래에 폴더 생성 후 `page.tsx` 추가

- **API 엔드포인트 추가**: 
  - `app/api/` 폴더에 새 라우트 생성
  - `route.js` 또는 `route.ts` 파일 생성

- **데이터베이스 스키마 변경**:
  - Web 앱: Supabase 대시보드에서 직접 수정
  - Grading 앱: `prisma/schema.prisma` 수정 후 마이그레이션

- **스타일 변경**:
  - 전역 스타일: `app/globals.css`
  - 컴포넌트 스타일: Tailwind 클래스 직접 수정

- **환경 변수 추가**:
  - `.env.local` 파일에 추가
  - `turbo.json`의 `globalEnv`에 추가 (빌드 시 필요한 경우)

- **인증 로직 변경**:
  - `lib/auth.js` 또는 `lib/auth.ts` 수정
  - 필요시 `middleware.js` 수정

- **새 공유 컴포넌트 추가**:
  - `packages/ui/src/components/`에 생성
  - `packages/ui/src/index.ts`에서 export

## 6. 주의사항 및 팁

### ⚠️ 절대 수정하면 안 되는 파일들
- `.next/` 폴더 내 모든 파일 (빌드 산출물)
- `node_modules/` 내 파일들
- `pnpm-lock.yaml` (직접 수정 금지)
- `.turbo/` 캐시 파일들

### ⚡ 수정 시 주의할 파일들
- `prisma/schema.prisma` - 마이그레이션 필요
- `middleware.js` - 전체 라우팅에 영향
- `turbo.json` - 빌드 프로세스에 영향
- 인증 관련 파일들 - 보안에 직접적 영향

### 💾 백업 권장 파일들
- `.env.local` - 환경 설정
- `prisma/schema.prisma` - 데이터베이스 스키마
- 각종 설정 파일들 (`*.config.js`)

### 🚀 개발 팁
1. **변경 전 확인**: `git status`로 현재 상태 확인
2. **로컬 테스트**: 배포 전 로컬에서 충분히 테스트
3. **의존성 확인**: 파일 수정 시 import하는 다른 파일들 확인
4. **타입 안전성**: TypeScript 파일은 타입 체크 통과 확인

---

*최종 업데이트: 2025-07-27*
*이 가이드는 프로젝트 구조 변경 시 업데이트가 필요합니다.*