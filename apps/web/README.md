# Bluenote Web App

> 교육 콘텐츠 관리 및 공유를 위한 메인 웹 애플리케이션

## 📱 개요

Bluenote Web App은 교사와 학생을 위한 통합 교육 플랫폼의 핵심 애플리케이션입니다. Next.js 15와 React 19를 기반으로 구축되었으며, 교육 콘텐츠 관리, 사용자 인증, 파일 업로드 등의 기능을 제공합니다.

### 주요 기능
- 📚 교육 콘텐츠 관리 (CMS)
- 👥 사용자 인증 및 권한 관리
- 📄 마크다운 문서 업로드 및 편집
- 🖼️ 이미지 업로드 및 관리
- 📊 관리자 대시보드
- 🔒 역할 기반 접근 제어 (RBAC)

## 🛠 기술 스택

- **프레임워크**: Next.js 15.3.5 (App Router)
- **런타임**: React 19.1.0
- **언어**: JavaScript (TypeScript 준비 중)
- **스타일링**: Tailwind CSS
- **인증**: NextAuth.js v4 (Google OAuth)
- **데이터베이스**: Supabase (PostgreSQL)
- **상태 관리**: React Context API
- **UI 컴포넌트**: @bluenote/ui (공유 컴포넌트)
- **배포**: Vercel

## 🚀 시작하기

### 환경 설정

1. 환경 변수 파일 생성:
```bash
cp .env.example .env.local
```

2. 필수 환경 변수 설정:
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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

자세한 환경 변수 설정은 [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)를 참고하세요.

### 개발 실행

```bash
# 의존성 설치 (루트 디렉토리에서)
pnpm install

# 개발 서버 실행
pnpm dev --filter=web

# 또는 현재 디렉토리에서
npm run dev
```

앱이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # 관리자 페이지
│   │   ├── api/          # API 라우트
│   │   ├── auth/         # 인증 페이지
│   │   └── programs/     # 프로그램 페이지
│   ├── components/       # React 컴포넌트
│   │   ├── admin/        # 관리자 컴포넌트
│   │   ├── auth/         # 인증 컴포넌트
│   │   ├── landing/      # 랜딩 페이지 컴포넌트
│   │   └── shared/       # 공유 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   │   ├── supabase/     # Supabase 클라이언트
│   │   └── utils/        # 헬퍼 함수
│   └── styles/           # 전역 스타일
├── public/               # 정적 파일
├── .env.local            # 환경 변수
└── package.json          # 프로젝트 설정
```

## 🔐 인증 및 권한

### 사용자 역할
- **Admin**: 모든 권한
- **Editor**: 콘텐츠 편집 권한
- **Viewer**: 읽기 전용 권한
- **User**: 기본 사용자 권한

### 권한 관리
자세한 권한 설정은 [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md)를 참고하세요.

## 📝 주요 기능 가이드

### 마크다운 업로드
- 지원 형식: `.md`, `.mdx`
- 이미지 자동 처리
- 메타데이터 추출
- [상세 가이드](./MD_UPLOAD_GUIDE.md)

### 이미지 업로드
- 지원 형식: JPG, PNG, GIF, WebP
- 자동 최적화
- Supabase Storage 사용
- [상세 가이드](./IMAGE_UPLOAD_GUIDE.md)

## 🚀 배포

### Vercel 배포
1. Vercel 프로젝트 생성
2. Root Directory: `apps/web`
3. 환경 변수 설정
4. 자동 배포 설정

자세한 배포 가이드는 [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)를 참고하세요.

## 🔧 개발 가이드

### 코드 컨벤션
- ES6+ 문법 사용
- React Hooks 기반 컴포넌트
- 비동기 처리에 async/await 사용
- 에러 처리 필수

### 폴더 구조 컨벤션
- 기능별로 컴포넌트 그룹화
- 공통 컴포넌트는 `shared` 폴더에
- API 라우트는 RESTful 규칙 준수

## 🐛 디버깅

### 일반적인 문제
1. **로그인 오류**: Google OAuth 설정 확인
2. **DB 연결 오류**: Supabase 환경 변수 확인
3. **권한 오류**: 사용자 역할 확인

## 📚 관련 문서

- [프로젝트 개요](../../PROJECT_CONTEXT.md)
- [아키텍처 문서](../../ARCHITECTURE_CONTEXT.md)
- [모노레포 가이드](../../CLAUDE.md)
- [Google OAuth 설정](../../docs/setup/GOOGLE_OAUTH_SETUP.md)

## 🤝 기여

1. Feature 브랜치 생성
2. 변경사항 커밋
3. 문서 업데이트
4. Pull Request 생성

---

*최종 업데이트: 2025년 8월 1일*