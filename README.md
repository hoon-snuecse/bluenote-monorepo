# BlueNote 교육 플랫폼

> AI 기반 교육 도구와 콘텐츠를 제공하는 통합 교육 플랫폼

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://bluenote.site)
[![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20|%20TypeScript%20|%20Supabase-blue)]()
[![License](https://img.shields.io/badge/License-Private-red)]()

## 🎯 프로젝트 개요

BlueNote는 교사와 학생을 위한 종합 교육 플랫폼으로, AI 기반 학습 도구를 제공합니다.

### 주요 기능
- 🌐 **Web App**: 교육 콘텐츠 관리 및 공유 플랫폼
- 📝 **Grading System**: AI 기반 글쓰기 평가 시스템
- 🧩 **Quiz Maker**: AI 자동 퀴즈 생성 도구

## 📁 프로젝트 구조

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

## 🚀 시작하기

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

## ⚙️ 환경 설정

각 앱의 루트 디렉토리에 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요.

### 공통 환경 변수

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

### 앱별 환경 변수

각 앱의 특정 환경 변수는 해당 앱의 문서를 참고하세요:
- [Web App 환경 설정](./apps/web/ENV_SETUP_GUIDE.md)
- [Grading System 환경 설정](./apps/grading/docs/ENVIRONMENT_VARIABLES.md)

## 🚀 배포

Vercel을 통한 모노레포 배포를 지원합니다.

### Vercel 배포 설정

1. **프로젝트 생성**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 레포지토리 연결

2. **앱별 설정**
   - Root Directory: `apps/web` 또는 `apps/grading`
   - Framework Preset: Next.js (자동 감지)
   - Build Command: `pnpm build` (자동 설정)

3. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 필요한 환경 변수 추가

### 배포된 앱

- 🌐 **Web App**: [https://bluenote.site](https://bluenote.site)
- 📝 **Grading System**: [https://grading.bluenote.site](https://grading.bluenote.site)
- 🧩 **Quiz Maker**: [https://quiz.bluenote.site](https://quiz.bluenote.site)

## 📚 문서

자세한 문서는 [문서 센터](./docs/README.md)를 참고하세요.

### 주요 문서
- [프로젝트 컨텍스트](./PROJECT_CONTEXT.md)
- [아키텍처 개요](./ARCHITECTURE_CONTEXT.md)
- [개발 가이드](./CLAUDE.md)
- [Google OAuth 설정](./docs/setup/GOOGLE_OAUTH_SETUP.md)

## 🤝 기여

프로젝트에 기여하실 때는 다음 가이드라인을 따라주세요:

1. 기능 추가/버그 수정 전 Issue 생성
2. Feature branch에서 작업
3. 문서 업데이트 포함
4. Pull Request 생성

## 📄 라이선스

이 프로젝트는 비공개 소프트웨어입니다. 모든 권리는 BlueNote에 귀속됩니다.

## 📧 문의

- 이메일: support@bluenote.site
- 개발자: hoon@iw.es.kr

---

*최종 업데이트: 2025년 8월 1일*