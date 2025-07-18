# AI 글쓰기 평가 시스템

AI 기반 학생 글쓰기 평가 및 분석 시스템

## 주요 기능

- 📝 **과제 관리**: 글쓰기 과제 생성 및 관리
- 🤖 **AI 평가**: Claude API를 활용한 자동 평가
- 📊 **통합 대시보드 (신규)**: `/dashboard-beta` - 모든 기능을 한 곳에서
  - 실시간 평가 현황 모니터링 (SSE)
  - 고급 통계 분석 (시계열, 상관관계, 분포, 성장률)
  - PDF 보고서 생성 (한글 지원)
  - 배치 평가 기능 (여러 학생 동시 평가)
  - 성능 최적화 (가상화, 캐싱, 코드 스플리팅)
- 💬 **실시간 채팅**: 교사 간 실시간 커뮤니케이션
- 📈 **분석 리포트**: 개별/전체 학생 성과 분석
- 🔐 **인증 시스템**: JWT 기반 보안 인증

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **AI**: Claude API (Anthropic)
- **실시간**: Server-Sent Events (SSE)
- **배포**: Docker, Docker Compose

## 시작하기

### 개발 환경 설정

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-repo/grading-app.git
   cd grading-app
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 필요한 값 설정
   ```

4. **데이터베이스 설정**
   ```bash
   npm run db:push
   npm run db:seed  # 관리자 계정 생성
   ```

5. **개발 서버 실행**
   ```bash
   npm run dev
   ```

### 기본 계정

- **이메일**: admin@school.edu
- **비밀번호**: admin123

⚠️ 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

## 프로덕션 배포

### Docker를 사용한 배포

1. **환경 변수 설정**
   ```bash
   cp .env.production .env
   # 프로덕션 환경에 맞게 .env 파일 수정
   ```

2. **Docker Compose로 실행**
   ```bash
   docker-compose up -d
   ```

3. **헬스 체크**
   ```bash
   curl http://localhost:3000/api/health
   ```

### 수동 배포

1. **빌드**
   ```bash
   npm run build
   ```

2. **데이터베이스 마이그레이션**
   ```bash
   npm run db:migrate:prod
   ```

3. **서버 시작**
   ```bash
   npm start
   ```

## 환경 변수

### 필수 환경 변수

- `DATABASE_URL`: 데이터베이스 연결 문자열
- `JWT_SECRET`: JWT 토큰 서명용 비밀 키
- `ENCRYPTION_KEY`: 데이터 암호화용 키
- `NEXT_PUBLIC_BASE_URL`: 애플리케이션 URL

### 선택적 환경 변수

- `CLAUDE_API_KEY`: Claude API 키 (AI 평가용)
- `OPENAI_API_KEY`: OpenAI API 키 (대안)
- `SENTRY_DSN`: Sentry 오류 추적

## 스크립트

```bash
# 개발
npm run dev          # 개발 서버 실행
npm run lint         # 린팅
npm run type-check   # 타입 체크

# 데이터베이스
npm run db:push      # 스키마 동기화
npm run db:migrate   # 마이그레이션 실행
npm run db:seed      # 시드 데이터 생성
npm run db:studio    # Prisma Studio 실행

# 배포
npm run build        # 프로덕션 빌드
npm run deploy       # 배포 스크립트 실행

# Docker
npm run docker:build        # Docker 이미지 빌드
npm run docker:compose      # Docker Compose 실행
npm run docker:compose:logs # 로그 확인
```

## 시스템 요구사항

- Node.js 20.x 이상
- PostgreSQL 15.x (프로덕션)
- Docker & Docker Compose (선택사항)
- 최소 2GB RAM
- 최소 10GB 디스크 공간

## 보안 고려사항

1. **환경 변수**: 모든 민감한 정보는 환경 변수로 관리
2. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
3. **API 키**: API 키는 암호화하여 저장
4. **인증**: JWT 토큰 기반 인증 구현
5. **CORS**: 적절한 CORS 정책 설정

## 모니터링

- **헬스 체크**: `/api/health`
- **로그**: Docker Compose 로그 또는 PM2 로그
- **성능**: 내장 성능 모니터링 유틸리티

## 문제 해결

### 포트 충돌
```bash
# 3000 포트 사용 중인 프로세스 확인
lsof -i :3000
# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 오류
1. `DATABASE_URL` 확인
2. PostgreSQL 서비스 실행 확인
3. 방화벽 설정 확인

### 빌드 오류
```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.