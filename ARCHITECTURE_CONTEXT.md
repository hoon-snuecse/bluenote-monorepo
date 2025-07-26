# ARCHITECTURE_CONTEXT.md

## 시스템 아키텍처 구조

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 인터페이스                          │
├─────────────────────┬───────────────────┬──────────────────────┤
│    Web App (JS)     │  Grading App (TS) │  Bluenote (Legacy)  │
├─────────────────────┴───────────────────┴──────────────────────┤
│                      공유 패키지 레이어                            │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   UI    │  │   Auth   │  │  Config  │  │ Shared-Infra  │  │
│  └─────────┘  └──────────┘  └──────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                       외부 서비스 레이어                           │
│  ┌──────────┐  ┌────────────┐  ┌─────────┐  ┌──────────────┐ │
│  │ Supabase │  │ Claude API │  │ Vercel  │  │ Google OAuth │ │
│  └──────────┘  └────────────┘  └─────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 애플리케이션 레이어

#### 1. Web App (JavaScript)
- **역할**: 메인 교육 콘텐츠 관리 시스템
- **주요 경로**:
  - `/admin/*`: 관리자 대시보드
  - `/research/*`, `/teaching/*`, `/analytics/*`, `/shed/*`: 콘텐츠 섹션
  - `/ai/chat`: Claude AI 채팅 인터페이스
- **특징**: 
  - Server Components 우선 접근
  - 동적 라우팅 활용
  - Supabase 직접 통합

#### 2. Grading App (TypeScript)
- **역할**: AI 기반 작문 평가 시스템
- **주요 경로**:
  - `/assignments/*`: 과제 관리
  - `/submissions/*`: 제출물 관리
  - `/evaluations/*`: 평가 결과
  - `/api/stats/*`: 통계 API
- **특징**:
  - 타입 안정성 보장
  - Prisma ORM 사용
  - 스트리밍 평가 지원

#### 3. 공유 패키지
- **@bluenote/ui**: 공통 UI 컴포넌트 (버튼, 카드, 모달 등)
- **@bluenote/auth**: NextAuth 설정 및 인증 로직
- **@bluenote/config**: ESLint, TypeScript, Tailwind 설정
- **@bluenote/shared-infra**: 공통 유틸리티 및 타입

## 핵심 컴포넌트 및 모듈 분석

### 인증 시스템
```typescript
// packages/auth/src/authOptions.ts
export function createAuthOptions(callbacks) {
  return {
    providers: [GoogleProvider],
    callbacks: {
      signIn: checkUserPermission,
      session: enrichSession,
      jwt: handleJWT
    }
  }
}
```

**특징**:
- 화이트리스트 기반 접근 제어
- 역할 기반 권한 관리 (admin/user)
- 세션에 사용자 권한 정보 포함

### 데이터베이스 접근 패턴

#### Web App - Supabase 직접 접근
```javascript
// lib/supabase/client.js
const supabase = createClient(url, anonKey)
const { data, error } = await supabase
  .from('table')
  .select('*')
```

#### Grading App - Prisma ORM
```typescript
// lib/prisma.ts
const prisma = new PrismaClient()
const data = await prisma.evaluation.findMany({
  where: { evaluatedByUser: email }
})
```

### API 통신 패턴

#### 1. 내부 API 호출
```javascript
// 같은 앱 내부
const res = await fetch('/api/endpoint')

// 크로스 앱 (CORS 처리)
const res = await fetch('http://localhost:3002/api/stats')
```

#### 2. 서버사이드 프록시 패턴
```javascript
// web/app/api/admin/grading-stats/route.js
export async function GET() {
  const gradingUrl = process.env.NODE_ENV === 'production'
    ? 'https://grading.bluenote.site/api/stats'
    : 'http://localhost:3002/api/stats'
  
  const response = await fetch(gradingUrl)
  return NextResponse.json(await response.json())
}
```

### 상태 관리

#### 1. 서버 상태
- React Server Components 활용
- 서버사이드 데이터 페칭
- 캐싱 전략: `cache: 'no-store'` 또는 `revalidate`

#### 2. 클라이언트 상태
- useState/useEffect 조합
- 커스텀 훅 (useDebounce, useAPICache 등)
- Context API (NotificationContext, UserContext)

## 사용된 디자인 패턴 및 코딩 컨벤션

### 디자인 패턴

#### 1. Compound Component Pattern
```jsx
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>
```

#### 2. Provider Pattern
```jsx
<Providers>
  <SessionProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </SessionProvider>
</Providers>
```

#### 3. Repository Pattern (Grading App)
```typescript
// 데이터 접근 로직 분리
class EvaluationRepository {
  async create(data) { return prisma.evaluation.create({ data }) }
  async findByUser(email) { return prisma.evaluation.findMany({ where: { evaluatedByUser: email } }) }
}
```

#### 4. Factory Pattern (AI Evaluator)
```typescript
function createEvaluator(type: 'claude' | 'mock') {
  switch(type) {
    case 'claude': return new ClaudeEvaluator()
    case 'mock': return new MockEvaluator()
  }
}
```

### 코딩 컨벤션

#### 1. 파일 명명 규칙
- **컴포넌트**: PascalCase (`AdminDashboard.js`)
- **유틸리티**: camelCase (`authHelpers.js`)
- **API 라우트**: kebab-case (`user-activity/route.js`)
- **상수**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

#### 2. 컴포넌트 구조
```javascript
// 1. Imports
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// 2. Component Definition
export default function ComponentName() {
  // 3. Hooks
  const { data: session } = useSession()
  const [state, setState] = useState()
  
  // 4. Effects
  useEffect(() => {}, [])
  
  // 5. Event Handlers
  const handleClick = () => {}
  
  // 6. Render
  return <div>...</div>
}
```

#### 3. API 응답 형식
```javascript
// 성공
return NextResponse.json({
  data: result,
  message: 'Success'
})

// 에러
return NextResponse.json({
  error: 'Error message',
  details: error.message
}, { status: 400 })
```

#### 4. 타입스크립트 컨벤션 (Grading App)
```typescript
// Interface over Type
interface UserData {
  email: string
  role: 'admin' | 'user'
}

// Strict null checks
const user: UserData | null = await getUser()
if (!user) return

// Type guards
function isAdmin(user: UserData): boolean {
  return user.role === 'admin'
}
```

### 보안 패턴

#### 1. 인증 체크
```javascript
const session = await getServerSession(authOptions)
if (!session || !session.user.isAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### 2. 입력 검증
```javascript
if (!submissionId || !assignmentId) {
  return NextResponse.json(
    { error: 'Required fields missing' },
    { status: 400 }
  )
}
```

#### 3. CORS 설정
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

### 성능 최적화 패턴

#### 1. 병렬 데이터 페칭
```javascript
const [users, logs, stats] = await Promise.all([
  fetchUsers(),
  fetchLogs(),
  fetchStats()
])
```

#### 2. 동적 임포트
```javascript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
})
```

#### 3. 메모이제이션
```javascript
const expensiveCalculation = useMemo(() => {
  return calculateComplexValue(data)
}, [data])
```

---

*최종 업데이트: 2025-07-26*