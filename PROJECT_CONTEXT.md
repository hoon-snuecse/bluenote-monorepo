# PROJECT_CONTEXT.md

## 프로젝트 개요

**BlueNote Monorepo**는 교육 도구와 콘텐츠 관리 시스템을 포함하는 통합 교육 플랫폼입니다.

### 주요 목적
- 교육자를 위한 통합 콘텐츠 관리 시스템 제공
- AI 기반 작문 평가 시스템으로 교사의 업무 효율화
- 연구, 교육, 분석 콘텐츠의 체계적 관리

### 주요 기능
1. **콘텐츠 관리 시스템 (CMS)**
   - 연구, 교육, 분석, 일상 카테고리별 콘텐츠 관리
   - Claude AI를 활용한 콘텐츠 생성 지원
   - 파일 업로드 및 관리

2. **AI 작문 평가 시스템**
   - Claude Sonnet/Opus 모델을 활용한 자동 채점
   - 학생별 상세 평가 리포트 생성
   - 교사용 대시보드 및 통계 분석

3. **관리자 대시보드**
   - 사용자별 활동 상태 모니터링
   - AI 사용량 통계 및 제한 관리
   - 모델별 채점 통계 분석

## 기술 스택 및 개발 환경

### 핵심 기술
- **Monorepo 관리**: pnpm workspaces + Turborepo
- **프론트엔드**: Next.js 15.3.x, React 19
- **스타일링**: Tailwind CSS
- **인증**: NextAuth with Google OAuth
- **데이터베이스**: Supabase (PostgreSQL), Prisma ORM
- **AI**: Claude API (Anthropic)
- **배포**: Vercel

### 개발 환경
- **Node.js**: >=18
- **패키지 매니저**: pnpm 9.13.2
- **빌드 도구**: Turborepo 2.3.3
- **타입스크립트**: 5.5.4 (grading 앱)
- **린팅**: ESLint + Prettier

## 프로젝트 구조

```
bluenote-monorepo/
├── apps/                      # 독립적인 애플리케이션들
│   ├── bluenote/             # BlueNote Atelier (레거시)
│   ├── web/                  # 메인 교육 웹사이트 (JavaScript)
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React 컴포넌트
│   │   ├── lib/              # 유틸리티 함수
│   │   └── public/           # 정적 파일
│   └── grading/              # AI 작문 평가 시스템 (TypeScript)
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   ├── components/   # React 컴포넌트
│       │   └── lib/          # 비즈니스 로직
│       └── prisma/           # 데이터베이스 스키마
├── packages/                  # 공유 패키지
│   ├── ui/                   # 공통 UI 컴포넌트
│   ├── auth/                 # 인증 로직
│   ├── config/               # 공통 설정
│   └── shared-infra/         # 공유 인프라
├── docs/                     # 프로젝트 문서
├── turbo.json                # Turborepo 설정
├── pnpm-workspace.yaml       # pnpm 워크스페이스 설정
└── vercel.json               # Vercel 배포 설정
```

## 현재 개발 상태

### ✅ 완료된 작업
1. **모노레포 구조 설정**
   - pnpm workspaces 구성
   - Turborepo 빌드 파이프라인 설정
   - 공유 패키지 구조 확립

2. **인증 시스템**
   - NextAuth Google OAuth 통합
   - 역할 기반 접근 제어 (RBAC)
   - 사용자 권한 관리

3. **CMS 기능**
   - 4개 카테고리별 CRUD 기능
   - 파일 업로드 (이미지/문서)
   - Claude AI 콘텐츠 생성 통합

4. **AI 작문 평가**
   - Claude API 통합 (Sonnet/Opus)
   - 평가 결과 저장 및 조회
   - 교사용 대시보드

5. **통계 및 분석**
   - 사용자별 활동 상태 추적
   - AI 모델별 사용 통계
   - 로그인 패턴 분석

### 🚧 진행 중인 작업
1. **사용자 경험 개선**
   - 디바이스/브라우저 정보 수집
   - 세션 시간 추적
   - 활동 패턴 분석

2. **성능 최적화**
   - API 응답 캐싱
   - 이미지 최적화
   - 빌드 시간 단축

### 📋 대기 중인 작업
1. **테스트 환경 구축**
   - 단위 테스트 프레임워크 설정
   - E2E 테스트 자동화
   - CI/CD 파이프라인 개선

2. **문서화**
   - API 문서 자동 생성
   - 사용자 가이드 작성
   - 개발자 온보딩 문서

3. **보안 강화**
   - 취약점 스캐닝 자동화
   - 보안 헤더 강화
   - 감사 로그 시스템

## 주요 통합 서비스

### Supabase
- **용도**: 데이터베이스, 인증, 파일 스토리지
- **테이블**: user_permissions, usage_logs, content tables
- **RLS**: Row Level Security 정책 적용

### Claude API (Anthropic)
- **모델**: claude-sonnet-4-20250514, claude-opus-4-20250514
- **용도**: 콘텐츠 생성, 작문 평가
- **제한**: 사용자별 일일 사용량 제한

### Vercel
- **배포**: GitHub Integration을 통한 자동 배포
- **환경**: Production (bluenote.site), Preview (PR별)
- **설정**: vercel.json을 통한 커스텀 설정

## 환경 변수

각 앱은 독립적인 `.env.local` 파일을 가지며, 주요 환경 변수는 다음과 같습니다:

- `NEXTAUTH_SECRET`: NextAuth 세션 암호화
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth
- `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`: Supabase 연결
- `ANTHROPIC_API_KEY`: Claude API 키
- `DATABASE_URL`: Prisma 데이터베이스 연결 (grading 앱)

---

*최종 업데이트: 2025-07-26*