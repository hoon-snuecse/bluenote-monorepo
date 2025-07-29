# MCP 자동화 가이드

## 개요
이 문서는 Bluenote Monorepo에서 MCP (Model Context Protocol) 도구를 활용한 자동화 작업을 안내합니다.

## 사용 가능한 MCP 도구
- **Vercel**: 배포, 환경변수 관리, 프로젝트 설정
- **GitHub**: 저장소 관리, PR/Issue 자동화, 워크플로우
- **Supabase**: 데이터베이스 작업, 마이그레이션, 모니터링

## 주요 자동화 작업

### 1. 환경변수 동기화
모든 Vercel 프로젝트 간 공통 환경변수를 동기화합니다.

```javascript
// 예시: MCP를 통한 환경변수 동기화
const projects = ['bluenote-web', 'bluenote-grading', 'bluenote-quiz'];
const sharedEnvVars = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// 각 프로젝트에 환경변수 설정
for (const project of projects) {
  for (const envVar of sharedEnvVars) {
    // mcp__vercel-official__update-project-env
  }
}
```

### 2. 세션 관리 자동화
Supabase 세션 테이블 정리 및 모니터링

```sql
-- 만료된 세션 정리 (6시간마다 실행)
SELECT cleanup_expired_sessions();

-- 세션 통계 확인
SELECT * FROM session_stats;
```

### 3. 배포 자동화
```bash
# 모든 앱 순차적 배포
# 1. Web 앱 배포
# 2. Grading 앱 배포  
# 3. Quiz 앱 배포
```

### 4. PR 자동화
- packages/auth 변경 시 모든 앱 재배포
- 환경변수 동기화 확인
- 빌드 성공 여부 체크

## 실행 방법

### 환경변수 동기화 (수동)
1. Vercel 대시보드에서 하나의 프로젝트 환경변수 설정
2. MCP 도구로 다른 프로젝트에 복사
3. 배포 트리거

### 세션 정리 (자동)
- Supabase 대시보드에서 Cron Job 설정
- 또는 Edge Function으로 구현

### 모니터링
- Vercel Analytics에서 배포 상태 확인
- Supabase 대시보드에서 세션 통계 확인
- GitHub Actions에서 워크플로우 상태 확인

## 향후 계획

### Phase 2 (1주일)
- [ ] 중앙 인증 서비스 구축 (auth.bluenote.site)
- [ ] 공통 네비게이션 컴포넌트 생성
- [ ] E2E 테스트 자동화
- [ ] Vercel 환경변수 자동 동기화 구현

### Phase 3 (2-3주)
- [ ] Supabase 세션 스토어 완전 구현
- [ ] Redis 캐싱 레이어 추가
- [ ] 실시간 모니터링 대시보드
- [ ] GitHub Actions 통합 강화

### Phase 4 (1개월+)
- [ ] NextAuth v5 마이그레이션
- [ ] Edge Runtime 최적화
- [ ] 완전 자동화된 CI/CD 파이프라인
- [ ] AI 기반 보안 모니터링

## 주의사항
1. 프로덕션 환경변수는 신중하게 관리
2. 배포 전 항상 스테이징 환경에서 테스트
3. 세션 정리는 사용자 경험을 고려하여 실행
4. 모든 자동화는 로그와 알림 설정 필수

## 참고 자료
- [Vercel MCP Documentation](https://vercel.com/docs/mcp)
- [GitHub MCP API](https://docs.github.com/mcp)
- [Supabase MCP Guide](https://supabase.com/docs/mcp)