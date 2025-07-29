# Bluenote Monorepo 인증 시스템 개선 방안 (종합 보고서)

## 1. 현재 문제점 정리

### 1.1 크로스 도메인 세션 공유 실패
- **문제**: bluenote.site에서 로그인 후 quiz.bluenote.site 접속 시 재로그인 요구
- **원인**: NextAuth v4가 쿠키 도메인 설정을 제대로 적용하지 않음
  - 설정: `domain: '.bluenote.site'` 
  - 실제: 각 서브도메인에 개별적으로 쿠키 설정 (bluenote.site, quiz.bluenote.site)
- **영향**: 사용자가 각 앱마다 개별 로그인 필요

### 1.2 복잡한 OAuth 스코프 관리
- **문제**: Google Drive API 권한 요청으로 인한 복잡성
- **현재 스코프**: `openid email profile https://www.googleapis.com/auth/drive.file`
- **영향**: 
  - 불필요한 권한 요청으로 사용자 신뢰도 저하
  - 토큰 관리 복잡성 증가
  - 세션 공유 시 추가 복잡성

### 1.3 환경별 쿠키 이름 불일치
- **개발 환경**: `next-auth.session-token`
- **프로덕션 환경**: `__Secure-next-auth.session-token` (NextAuth v4 자동 적용)
- **영향**: 환경별 다른 처리 로직 필요

### 1.4 Monorepo 구조의 인증 통합 문제
- **문제**: 각 앱이 독립적인 Vercel 프로젝트로 배포
- **영향**: 
  - 환경 변수 동기화 필요
  - 빌드 시간 증가
  - 설정 불일치 가능성

### 1.5 네비게이션바 구조 차이점
- **Web 앱**: 내부 라우팅 사용, `/api/auth/session-check` 엔드포인트로 세션 확인
- **Grading 앱**: 외부 링크 사용 (https://bluenote.site), UserContext로 세션 관리
- **Quiz 앱**: 하이브리드 접근 (개발/프로덕션 분기), `/api/auth/session-check` 사용
- **영향**: 
  - 일관성 없는 사용자 경험
  - 세션 동기화 어려움
  - 로그인 상태 표시 불일치

## 2. 데이터베이스 영향 분석

### 2.1 현재 데이터베이스 구조
```sql
-- 현재 구조 (NextAuth 기본)
auth.users (Supabase Auth 관리)
├── id (UUID)
├── email
├── raw_user_meta_data (JSONB)
└── created_at

-- 추가 필요한 테이블
sessions (중앙 세션 관리)
├── id (UUID)
├── session_token (UNIQUE)
├── user_id (FK to auth.users)
├── expires (TIMESTAMP)
├── data (JSONB)
└── created_at
```

### 2.2 마이그레이션 계획
```sql
-- 1단계: 세션 테이블 생성
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own sessions" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_sessions_token ON public.sessions(session_token);
CREATE INDEX idx_sessions_expires ON public.sessions(expires);
```

### 2.3 기존 데이터 호환성
- **영향받는 테이블**: 없음 (새로운 테이블 추가만)
- **백업 필요성**: 낮음 (읽기 전용 작업)
- **롤백 계획**: 
  ```sql
  DROP TABLE IF EXISTS public.sessions CASCADE;
  ```

## 3. MCP (Model Context Protocol) 활용 방안

### 3.1 Vercel MCP 통합
```typescript
// .claude/mcp-config.json
{
  "vercel": {
    "projects": [
      {
        "name": "bluenote-web",
        "env": {
          "production": true,
          "preview": true
        }
      },
      {
        "name": "bluenote-grading",
        "env": {
          "production": true,
          "preview": true
        }
      },
      {
        "name": "bluenote-quiz",
        "env": {
          "production": true,
          "preview": true
        }
      }
    ],
    "automation": {
      "deploymentChecks": true,
      "envSync": true,
      "buildOptimization": true
    }
  }
}
```

### 3.2 GitHub MCP 워크플로우
```yaml
# .github/workflows/mcp-sync.yml
name: MCP Environment Sync

on:
  push:
    paths:
      - 'packages/auth/**'
      - '.env.example'

jobs:
  sync-environments:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/mcp-github-action@v1
        with:
          sync-env: true
          sync-secrets: true
          projects: |
            - vercel/bluenote-web
            - vercel/bluenote-grading
            - vercel/bluenote-quiz
```

### 3.3 Supabase MCP 데이터베이스 관리
```typescript
// mcp/supabase-tasks.ts
export const supabaseTasks = {
  // 세션 정리 작업
  cleanupExpiredSessions: {
    schedule: '0 */6 * * *', // 6시간마다
    query: `
      DELETE FROM public.sessions 
      WHERE expires < NOW() - INTERVAL '24 hours'
    `
  },
  
  // 세션 모니터링
  monitorCrossDomainSessions: {
    schedule: '*/5 * * * *', // 5분마다
    query: `
      SELECT 
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_sessions,
        AVG(EXTRACT(EPOCH FROM (expires - created_at))/3600)::int as avg_session_hours
      FROM public.sessions
      WHERE expires > NOW()
    `
  },
  
  // 백업 자동화
  backupAuthData: {
    schedule: '0 2 * * *', // 매일 새벽 2시
    tasks: [
      'backup-sessions-table',
      'backup-user-permissions',
      'backup-audit-logs'
    ]
  }
}
```

### 3.4 통합 MCP 대시보드
```typescript
// mcp/dashboard-config.ts
export const mcpDashboard = {
  vercel: {
    metrics: ['deployment-status', 'build-time', 'error-rate'],
    alerts: ['failed-deployment', 'high-error-rate']
  },
  github: {
    metrics: ['pr-merge-time', 'issue-resolution-time'],
    automation: ['auto-merge-dependabot', 'auto-label-issues']
  },
  supabase: {
    metrics: ['query-performance', 'storage-usage', 'active-sessions'],
    alerts: ['slow-queries', 'storage-limit', 'session-anomalies']
  }
}
```

## 4. 시스템 유지보수 개선 권고사항

### 4.1 모니터링 및 관찰성 (Observability)
```typescript
// packages/monitoring/src/auth-metrics.ts
export const authMetrics = {
  // 세션 공유 성공률
  sessionSharingRate: async () => {
    const logs = await supabase
      .from('auth_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 3600000))
    
    const crossDomainSuccess = logs.filter(
      log => log.event === 'session_shared' && log.success
    ).length
    
    return (crossDomainSuccess / logs.length) * 100
  },
  
  // 인증 레이턴시
  authLatency: {
    p50: 45,  // ms
    p95: 120, // ms
    p99: 300  // ms
  }
}
```

### 4.2 자동화된 테스트 전략
```typescript
// packages/auth/src/__tests__/e2e/cross-domain.test.ts
import { test, expect } from '@playwright/test'

test.describe('Cross-domain Authentication', () => {
  test('should maintain session across subdomains', async ({ page, context }) => {
    // 1. 메인 도메인 로그인
    await page.goto('https://bluenote.site/auth/signin')
    await page.click('button:has-text("Google로 로그인")')
    // ... OAuth 플로우 처리
    
    // 2. 쿠키 확인
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name.includes('session-token'))
    expect(sessionCookie?.domain).toBe('.bluenote.site')
    
    // 3. Quiz 앱 접속
    await page.goto('https://quiz.bluenote.site')
    await expect(page.locator('text=로그아웃')).toBeVisible()
    
    // 4. Grading 앱 접속
    await page.goto('https://grading.bluenote.site')
    await expect(page.locator('text=로그아웃')).toBeVisible()
  })
})
```

### 4.3 보안 강화 방안
```typescript
// packages/auth/src/security.ts
export const securityEnhancements = {
  // CSRF 토큰 검증 강화
  csrfProtection: {
    sameSite: 'lax',
    secure: true,
    httpOnly: true
  },
  
  // 세션 무결성 검증
  sessionIntegrity: {
    algorithm: 'HS256',
    secret: process.env.SESSION_INTEGRITY_SECRET,
    validateOnEveryRequest: true
  },
  
  // Rate Limiting
  rateLimiting: {
    signin: {
      windowMs: 15 * 60 * 1000, // 15분
      max: 5 // 최대 5회 시도
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1분
      max: 100 // 최대 100회 요청
    }
  },
  
  // IP 화이트리스트 (관리자용)
  adminIpWhitelist: process.env.ADMIN_IP_WHITELIST?.split(',') || []
}
```

### 4.4 성능 최적화
```typescript
// packages/auth/src/performance.ts
export const performanceOptimizations = {
  // 세션 캐싱 (Redis)
  caching: {
    provider: 'redis',
    ttl: 3600, // 1시간
    keyPrefix: 'bluenote:session:'
  },
  
  // Edge Functions 활용
  edgeAuth: {
    enabled: true,
    regions: ['icn1'], // 서울 리전
    fallback: 'origin'
  },
  
  // 프리페치 전략
  prefetch: {
    sessionCheck: true,
    userPermissions: true,
    interval: 300000 // 5분
  }
}
```

### 4.5 개발자 경험 (DX) 개선
```bash
# packages/auth/scripts/dev-setup.sh
#!/bin/bash

# 로컬 개발 환경 자동 설정
echo "🔧 Setting up authentication development environment..."

# 1. 환경 변수 복사
cp .env.example .env.local

# 2. 로컬 인증 서버 시작
docker-compose up -d auth-dev-server

# 3. 테스트 사용자 생성
pnpm run seed:test-users

# 4. 개발 인증서 생성 (로컬 HTTPS)
mkcert -install
mkcert "*.bluenote.local" bluenote.local localhost

echo "✅ Authentication dev environment ready!"
echo "📝 Add these to your /etc/hosts:"
echo "127.0.0.1 bluenote.local"
echo "127.0.0.1 quiz.bluenote.local"
echo "127.0.0.1 grading.bluenote.local"
```

## 5. 단계별 구현 로드맵

### Phase 1: 즉시 실행 (1일)
- [x] Google Drive 스코프 제거
- [x] 환경 변수 정리
- [ ] 데이터베이스 세션 테이블 생성
- [ ] MCP 설정 파일 작성

### Phase 2: 단기 개선 (1주일)
- [ ] 중앙 인증 서비스 구축
- [ ] 공통 네비게이션 컴포넌트 생성
- [ ] E2E 테스트 작성
- [ ] Vercel MCP 통합

### Phase 3: 중기 개선 (2-3주)
- [ ] Supabase 세션 스토어 구현
- [ ] Redis 캐싱 레이어 추가
- [ ] 모니터링 대시보드 구축
- [ ] GitHub Actions MCP 워크플로우

### Phase 4: 장기 개선 (1개월+)
- [ ] NextAuth v5 마이그레이션
- [ ] Edge Runtime 최적화
- [ ] 완전한 MCP 자동화
- [ ] AI 기반 보안 모니터링

## 6. 비용 및 리소스 분석

### 6.1 인프라 비용 예상
```yaml
현재 월 비용:
  Vercel: $20 x 3 apps = $60
  Supabase: $25 (Pro plan)
  총계: $85/월

개선 후 예상 비용:
  Vercel: $20 x 4 apps = $80 (auth 앱 추가)
  Supabase: $25 (변동 없음)
  Redis (Upstash): $10
  총계: $115/월 (+$30)

ROI 분석:
  - 개발 시간 절감: 월 10시간 x $50 = $500
  - 유지보수 비용 감소: 월 5시간 x $50 = $250
  - 순이익: $750 - $30 = $720/월
```

### 6.2 인력 및 시간 투자
```yaml
필요 인력:
  - 시니어 개발자: 1명 (풀타임 2주)
  - 주니어 개발자: 1명 (파트타임 지원)
  - DevOps: 파트타임 지원

예상 소요 시간:
  - Phase 1: 8시간
  - Phase 2: 40시간
  - Phase 3: 60시간
  - Phase 4: 80시간
  총계: 188시간 (약 5주)
```

## 7. 리스크 관리

### 7.1 기술적 리스크
| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|-----------|
| NextAuth v5 호환성 | 중 | 높음 | 단계적 마이그레이션 |
| 세션 동기화 실패 | 낮음 | 높음 | 폴백 메커니즘 구현 |
| 성능 저하 | 중 | 중간 | 캐싱 및 CDN 활용 |
| 보안 취약점 | 낮음 | 매우 높음 | 정기 보안 감사 |

### 7.2 운영 리스크
```typescript
// packages/auth/src/fallback.ts
export const fallbackStrategies = {
  // 중앙 인증 서비스 장애 시
  authServiceDown: {
    strategy: 'local-session-validation',
    cacheTimeout: 3600,
    alerting: true
  },
  
  // 데이터베이스 장애 시
  databaseDown: {
    strategy: 'redis-cache-only',
    gracePeriod: 1800,
    readOnly: true
  },
  
  // 네트워크 분할 시
  networkPartition: {
    strategy: 'eventual-consistency',
    syncInterval: 60,
    conflictResolution: 'last-write-wins'
  }
}
```

## 8. 성공 지표 (KPIs)

### 8.1 기술 지표
- 크로스 도메인 세션 공유 성공률: >99%
- 인증 응답 시간: <100ms (P95)
- 시스템 가용성: >99.9%
- 보안 사고: 0건

### 8.2 비즈니스 지표
- 사용자 재로그인 비율: <1%
- 개발자 생산성: +30%
- 지원 티켓 감소: -50%
- 사용자 만족도: +20%

## 9. 결론 및 다음 단계

인증 시스템 개선은 단순히 기술적 문제 해결을 넘어 전체 시스템의 안정성, 보안성, 확장성을 높이는 중요한 프로젝트입니다. MCP를 활용한 자동화와 모니터링을 통해 지속 가능한 시스템을 구축할 수 있습니다.

### 즉시 실행 사항:
1. 이 보고서를 팀과 공유하고 피드백 수집
2. Phase 1 작업 시작 (Google Drive 권한 제거)
3. MCP 설정 파일 작성 및 테스트
4. 데이터베이스 마이그레이션 스크립트 준비

### 주간 체크포인트:
- 매주 금요일 진행 상황 검토
- 블로커 및 리스크 평가
- 다음 주 계획 수립
- 성공 지표 측정

이 개선 작업을 통해 Bluenote 플랫폼은 더욱 안정적이고 확장 가능한 시스템으로 발전할 것입니다.