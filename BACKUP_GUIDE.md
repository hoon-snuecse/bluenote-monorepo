# Bluenote Monorepo 백업 가이드

## 백업 정보

- **버전**: v0.1
- **백업 날짜**: 2025-01-25
- **프로젝트 상태**: 모든 보안 이슈 해결 완료
- **인증 시스템**: email 기반에서 user.id 기반으로 마이그레이션 완료

## 📦 백업 파일 위치

### 1. 전체 프로젝트 백업
- **파일**: `/Users/hoon/bluenote-backups/bluenote-monorepo-backup-v0.1-20250725.tar.gz`
- **크기**: 178MB
- **포함 내용**:
  - 소스 코드 (apps/, packages/)
  - 설정 파일
  - 환경 변수 예제
  - 문서
  - Git 저장소
- **제외 내용**:
  - node_modules
  - .next (빌드 출력)
  - .turbo (캐시)
  - 로그 파일
  - build/dist 디렉토리
  - .vercel

### 2. 환경 변수 백업
- **디렉토리**: `/Users/hoon/bluenote-backups/env-backup-20250725/`
- **포함 파일**:
  - `web-env.local` - Web 앱 환경 변수
  - `grading-env.local` - Grading 앱 환경 변수
  - `env-checklist.md` - 환경 변수 체크리스트

## 🔄 복원 방법

### 1. 프로젝트 복원
```bash
# 홈 디렉토리로 이동
cd /Users/hoon

# 백업 파일 압축 해제
tar -xzf /Users/hoon/bluenote-backups/bluenote-monorepo-backup-v0.1-20250725.tar.gz

# 프로젝트 디렉토리로 이동
cd bluenote-monorepo
```

### 2. 의존성 설치
```bash
# pnpm을 사용하여 의존성 설치
pnpm install
```

### 3. 환경 변수 복원
```bash
# Web 앱 환경 변수 복원
cp /Users/hoon/bluenote-backups/env-backup-20250725/web-env.local apps/web/.env.local

# Grading 앱 환경 변수 복원
cp /Users/hoon/bluenote-backups/env-backup-20250725/grading-env.local apps/grading/.env.local
```

### 4. 개발 서버 실행
```bash
# 모든 앱 동시 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=web
pnpm dev --filter=grading
```

## 📋 주요 변경사항 (v0.1)

### 보안 개선
- ✅ Google OAuth Client Secret 교체
- ✅ NEXTAUTH_SECRET 재생성
- ✅ Supabase Database Password 변경
- ✅ Vercel Deploy Hook 재생성
- ✅ 노출된 모든 API 키/토큰 교체

### 시스템 개선
- ✅ 인증 시스템을 email에서 user.id 기반으로 변경
- ✅ 모든 관련 데이터 마이그레이션 완료
- ✅ Vercel 배포 설정 수정 (404 오류 해결)
- ✅ Google Drive 인증 문제 해결
- ✅ AI 평가 시스템 오류 수정

### 코드 정리
- ✅ 불필요한 임시 파일 제거
- ✅ 로그 파일 정리
- ✅ 이전 백업 폴더 제거
- ✅ 임시 SQL 스크립트 제거

## 🚨 보안 주의사항

1. **환경 변수 백업**은 민감한 정보(API 키, 비밀번호)를 포함합니다
2. 백업 파일을 안전한 위치에 보관하세요
3. Git에 환경 변수 파일을 커밋하지 마세요
4. 필요시 백업 파일을 암호화하여 보관하세요

## 🔧 문제 해결

### 복원 후 인증 문제
- NEXTAUTH_SECRET이 올바른지 확인
- Google OAuth 클라이언트 ID가 현재 활성화된 것인지 확인

### 데이터베이스 연결 문제
- DATABASE_URL이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### Vercel 배포 문제
- Vercel 환경 변수가 모두 설정되었는지 확인
- Deploy Hook URL이 최신인지 확인

## 📞 지원

추가 도움이 필요한 경우:
- GitHub Issues: https://github.com/hoon-snuecse/bluenote-monorepo/issues
- 프로젝트 문서: CLAUDE.md 파일 참조