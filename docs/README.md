# 📚 Bluenote 문서 센터 (v0.2.0)

> Bluenote 교육 플랫폼의 모든 문서를 한 곳에서 찾아보세요.
> 
> 최종 업데이트: 2025-01-08

## 🆕 v0.2.0 주요 변경사항

- **통합 인증 시스템**: 모든 앱이 @bluenote/supabase-auth 패키지 사용
- **크로스 도메인 세션**: *.bluenote.site 전체에서 인증 공유
- **Navigation 표준화**: 모든 앱에서 일관된 로그인 상태 표시
- **Quiz 앱 통합**: 완전한 인증 시스템 구현

## 🚀 시작하기

### 프로젝트 소개
- [프로젝트 개요](../README.md) - Bluenote 플랫폼 소개 (v0.2.0)
- [변경 이력](../CHANGELOG.md) - v0.2.0 변경사항 상세
- [프로젝트 컨텍스트](../PROJECT_CONTEXT.md) - 상세 프로젝트 배경 및 목표
- [아키텍처 개요](../ARCHITECTURE_CONTEXT.md) - 시스템 아키텍처

### 개발 환경 설정
- [모노레포 가이드](../CLAUDE.md) - pnpm 워크스페이스 설정 및 개발 가이드 (v0.2.0)
- [파일 구조 가이드](../FILE_STRUCTURE_GUIDE.md) - 프로젝트 구조 이해하기

## 📱 애플리케이션별 문서

### 🌐 Web App (메인 플랫폼)
- [개발 가이드](../apps/web/CLAUDE.md) - Web 앱 개발 지침
- [환경 변수 설정](../apps/web/ENV_SETUP_GUIDE.md)
- [이미지 업로드 가이드](../apps/web/IMAGE_UPLOAD_GUIDE.md)
- [마크다운 업로드 가이드](../apps/web/MD_UPLOAD_GUIDE.md)
- [권한 업데이트 가이드](../apps/web/PERMISSION_UPDATE_GUIDE.md)
- [배포 가이드](../apps/web/README_DEPLOYMENT.md)

### 📝 Grading System (AI 글쓰기 평가)
- [개발 가이드](../apps/grading/CLAUDE.md) - 평가 시스템 개발 지침
- [사용자 가이드](../apps/grading/docs/user-guide/USER_GUIDE.md) - 교사용 사용 설명서
- [배포 가이드](../apps/grading/docs/DEPLOYMENT.md)
- [환경 변수 설정](../apps/grading/docs/ENVIRONMENT_VARIABLES.md)
- [다음 버전 계획](../apps/grading/docs/NEXT_VERSION_PLAN.md)

### 🧩 Quiz Maker (AI 퀴즈 생성)
- [개발 가이드](../apps/quiz/CLAUDE.md) - 퀴즈 시스템 개발 지침
- [Claude API 설정](../apps/quiz/docs/claude-api-setup.md)
- [퀴즈 생성 프롬프트](../apps/quiz/docs/quiz-generation-prompt.md)
- [인증 통합 가이드](../apps/quiz/docs/web-app-auth-integration.md)

## 🛠️ 기술 문서

### 데이터베이스
- [데이터베이스 구조](../DATABASE_STRUCTURE.md)
- [데이터 관리 가이드](./data-management-guide.md)
- [데이터베이스 설정](../apps/grading/docs/database-setup.md)

### 보안 및 인증 (v0.2.0 업데이트)
- [Supabase Auth 설정](./SUPABASE_AUTH_SETUP.md) - 통합 인증 시스템 설정 (v0.2.0)
- [RLS 보안 리포트](./2025-07-27-rls-security-report.md)
- [사용자 권한 관리](../apps/web/docs/USER_PERMISSIONS.md)

### 운영 및 유지보수
- [백업 가이드](../BACKUP_GUIDE.md)
- [일일 통계 마이그레이션](../apps/web/docs/DAILY_STATS_MIGRATION.md)

## 📖 사용자 가이드

### 교사용
- [AI 글쓰기 평가 시스템 사용법](../apps/grading/docs/user-guide/USER_GUIDE.md)
- [PDF 변환 가이드](../apps/grading/docs/user-guide/PDF_CONVERSION_GUIDE.md)

### 학생용
- (준비 중)

## 🔧 참고 문서

### 개발 참고 자료
- [인증 개선 리포트](../apps/quiz/docs/authentication-improvement-report-v2.md)
- [이미지 목록](../apps/grading/docs/user-guide/IMAGE_LIST.md)

## 📋 문서 관리

### 문서 상태
- ✅ **최신**: 최근 업데이트되어 현재 시스템을 정확히 반영
- ⚠️ **업데이트 필요**: 일부 내용이 오래되어 검토 필요
- 🚨 **폐기 예정**: 더 이상 유효하지 않은 문서

### 문서 기여 가이드
1. 새 문서 작성 시 이 인덱스에 추가
2. 문서 상단에 최종 업데이트 날짜 기록
3. 관련 문서 간 상호 참조 링크 추가
4. 한국어/영어 병행 작성 권장

---

*최종 업데이트: 2025년 8월 1일*