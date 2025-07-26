# DEV_CONTINUITY.md

## 현재 작업 상황 및 마지막 변경사항

### 최근 주요 작업 (2025-07-27)

#### 0. bluenote 레거시 앱 제거
- **백업 위치**: `/Users/hoon/bluenote-backups/bluenote-app-backup-20250727-011011.tar.gz`
- **제거 이유**: 모든 기능이 web 앱에 이미 구현됨
- **효과**: 코드베이스 단순화, 유지보수성 향상

### 이전 주요 작업 (2025-07-26)

#### 1. 사용자별 활동 상태 통계 구현
- **변경 파일**:
  - `apps/web/app/admin/analytics/AdminAnalyticsClient.js`
  - `apps/web/app/api/admin/user-activity/route.js`
  - `apps/grading/src/app/api/stats/user-evaluations/route.ts`
- **구현 내용**:
  - "최근 가입 사용자" → "사용자별 활동 상태"로 변경
  - 로그인 통계 (오늘/주/총) 집계
  - AI 채점 횟수 모델별 표시
  - 테이블 형식 UI로 개선

#### 2. 평가자 추적 시스템 구현
- **데이터베이스 변경**:
  - `Evaluation` 테이블에 `evaluatedByUser` 필드 추가
  - 마이그레이션 SQL: `/apps/grading/docs/MIGRATION_EVALUATED_BY_USER.sql`
- **API 수정**:
  - 평가 API에서 세션 정보로 사용자 이메일 저장
  - 통계 API에서 학생명 대신 평가자 이메일 사용

#### 3. Vercel 배포 이슈 해결
- **문제**: Vercel CLI와 GitHub Integration 중복 배포
- **해결**:
  - Vercel CLI 글로벌 제거
  - `.vercelignore` 파일 수정
  - GitHub Integration만 사용하도록 통일

### 진행 중인 태스크와 구현 방법

#### 1. 디바이스/브라우저 정보 수집 (TODO)
**위치**: `apps/web/app/api/admin/user-activity/route.js:129`

**구현 계획**:
```javascript
// 1. 로그인 시 User-Agent 수집
// apps/web/lib/auth.js - logSignIn 함수 수정
logSignIn: async (email, request) => {
  const userAgent = request.headers.get('user-agent');
  const deviceInfo = parseUserAgent(userAgent);
  
  await supabase.from('usage_logs').insert({
    user_email: email,
    action_type: 'login',
    metadata: {
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    }
  });
}

// 2. User-Agent 파싱 유틸리티
function parseUserAgent(ua) {
  // ua-parser-js 라이브러리 활용
  const parser = new UAParser(ua);
  return {
    device: parser.getDevice().type || 'desktop',
    browser: parser.getBrowser().name,
    os: parser.getOS().name
  };
}
```

#### 2. 에러 리포팅 시스템 (TODO)
**위치**: `apps/grading/src/components/ErrorBoundary.tsx:53`

**구현 계획**:
- Sentry 통합 설정
- 환경별 DSN 구성
- 사용자 컨텍스트 추가

#### 3. 평가 편집 기능 (TODO)
**위치**: `apps/grading/src/app/report/[id]/page.tsx:65`

**구현 계획**:
- PUT API 엔드포인트 생성
- 수정 이력 저장
- 권한 체크 (평가자 본인만 수정 가능)

## 다음 단계 작업 계획

### 단기 계획 (1-2주)

#### 1. 사용자 경험 개선
- [ ] 디바이스/브라우저 정보 수집 완성
- [ ] 활동 로그 상세 뷰 추가
- [ ] 실시간 알림 시스템 구현

#### 2. 성능 최적화
- [ ] API 응답 캐싱 전략 수립
- [ ] 이미지 최적화 (Next.js Image 컴포넌트)
- [ ] 빌드 시간 최적화 (번들 분석)

#### 3. 테스트 환경 구축
- [ ] Jest + React Testing Library 설정
- [ ] Playwright E2E 테스트 설정
- [ ] GitHub Actions CI 파이프라인

### 중기 계획 (1-2개월)

#### 1. 기능 확장
- [ ] 대량 평가 배치 처리
- [ ] 평가 결과 PDF 내보내기
- [ ] 학생/학부모용 포털

#### 2. 데이터 분석 강화
- [ ] 평가 트렌드 분석
- [ ] 학생별 성장 추적
- [ ] AI 모델 성능 비교

#### 3. 보안 강화
- [ ] 2FA 구현
- [ ] API Rate Limiting
- [ ] 감사 로그 시스템

## 현재 알려진 문제점 및 고민사항

### 1. 기술적 이슈

#### Cross-Origin 문제
- **문제**: 모노레포 내 앱 간 API 호출 시 CORS 에러
- **현재 해결책**: 서버사이드 프록시 패턴 사용
- **고민**: 더 효율적인 내부 통신 방법?

#### TypeScript 혼용
- **문제**: web 앱(JS)과 grading 앱(TS) 간 타입 불일치
- **고민**: 전체 TypeScript 마이그레이션 vs 현재 구조 유지

#### 데이터베이스 이중화
- **문제**: Supabase와 Prisma 동시 사용
- **고민**: 통합 vs 분리 유지

### 2. 비즈니스 로직 이슈

#### AI 사용량 제한
- **현재**: 사용자별 일일 제한
- **고민**: 월별 제한? 크레딧 시스템?

#### 평가 일관성
- **문제**: 같은 글에 대한 AI 평가 결과 차이
- **고민**: 평가 기준 표준화 방법

### 3. 운영 이슈

#### 모니터링 부재
- **문제**: 에러 발생 시 즉시 파악 어려움
- **필요**: APM 도구 도입 (DataDog, New Relic 등)

#### 백업 전략
- **현재**: Supabase 자동 백업 의존
- **필요**: 자체 백업 및 복구 프로세스

## 개발 팁 및 주의사항

### 1. 로컬 개발 환경
```bash
# 전체 앱 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=web

# 포트 정보
# - web: 3000 (또는 3001)
# - grading: 3002
```

### 2. 환경 변수 체크리스트
- [ ] `.env.local` 파일 존재 확인
- [ ] Supabase 연결 정보
- [ ] Claude API 키
- [ ] NextAuth 설정

### 3. 일반적인 문제 해결
- **빌드 에러**: `pnpm install` 후 재시도
- **Prisma 에러**: `npx prisma generate` 실행
- **CORS 에러**: 프록시 API 사용 확인

### 4. 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

## 연락 및 참고 자료

### 주요 문서
- `/CLAUDE.md`: AI 어시스턴트용 가이드
- `/apps/web/CLAUDE.md`: Web 앱 상세 가이드
- `/apps/grading/CLAUDE.md`: Grading 앱 상세 가이드

### 외부 리소스
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Claude API Docs](https://docs.anthropic.com)

### 배포 URL
- Production: https://bluenote.site
- Grading: https://grading.bluenote.site

---

*최종 업데이트: 2025-07-27*
*작성자: Claude AI Assistant & 개발팀*
*변경사항: bluenote 레거시 앱 제거*