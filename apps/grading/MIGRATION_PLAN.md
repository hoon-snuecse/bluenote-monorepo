# Grading 앱 Supabase Auth 마이그레이션 계획

## 목표
NextAuth 기반 인증 시스템을 Supabase Auth로 완전히 전환하여 monorepo 전체 인증 체계 통일

## 현재 상태 분석

### 사용 중인 인증 관련 요소
- **NextAuth** (`@bluenote/auth` 패키지)
- **Supabase** (데이터베이스 용도로만 사용)
- **Prisma ORM** (Supabase PostgreSQL 연결)
- **user_permissions 테이블** (세밀한 권한 관리)

### 주요 인증 사용 패턴
1. **서버 사이드**: `getServerSession()` 
2. **클라이언트 사이드**: `useSession()`, `SessionProvider`
3. **권한 체크**: `user_permissions` 테이블 조회
4. **API 보호**: 각 route에서 세션 체크

## 마이그레이션 단계별 계획

### Phase 1: 의존성 설치 및 환경 설정
```bash
# 1. @bluenote/supabase-auth 패키지 추가
pnpm add @bluenote/supabase-auth --filter=grading

# 2. 환경 변수 확인 (.env.local)
# - NEXT_PUBLIC_SUPABASE_URL ✅ (이미 있음)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ (이미 있음)
# - SUPABASE_SERVICE_ROLE_KEY ✅ (이미 있음)
```

### Phase 2: Supabase Auth 클라이언트 설정
```typescript
// src/lib/supabase-auth.ts (새 파일)
import { createClient } from '@bluenote/supabase-auth/client'
import { createServerClient } from '@bluenote/supabase-auth/server'

export { createClient, createServerClient }
```

### Phase 3: 인증 미들웨어 마이그레이션
```typescript
// src/middleware.ts
// NextAuth 미들웨어 → Supabase Auth 미들웨어로 변경
import { createServerClient } from '@bluenote/supabase-auth/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // 인증이 필요한 경로 보호
  if (!session && protectedPaths.includes(pathname)) {
    return NextResponse.redirect('/auth/signin')
  }
}
```

### Phase 4: API 라우트 인증 로직 변경

#### 4.1 기존 패턴 (NextAuth)
```typescript
import { getServerSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

#### 4.2 새로운 패턴 (Supabase Auth)
```typescript
import { getSession } from '@bluenote/supabase-auth/server'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

### Phase 5: 클라이언트 컴포넌트 인증 훅 교체

#### 5.1 Provider 교체
```typescript
// src/components/Providers.tsx
import { SupabaseAuthProvider } from '@bluenote/supabase-auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  )
}
```

#### 5.2 Hook 사용 교체
```typescript
// 기존: import { useSession } from 'next-auth/react'
// 새로운: import { useSupabaseAuth } from '@bluenote/supabase-auth'

const { session, loading } = useSupabaseAuth()
```

### Phase 6: 권한 관리 시스템 유지

**user_permissions 테이블은 그대로 유지**
- Supabase Auth는 인증만 담당
- 세밀한 권한 관리는 기존 user_permissions 테이블 활용
- Service Role Key로 RLS 우회하여 권한 체크

### Phase 7: 로그인/로그아웃 플로우 변경

#### 7.1 로그인
```typescript
// 기존: signIn('google')
// 새로운:
const supabase = createClient()
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

#### 7.2 로그아웃
```typescript
// 기존: signOut()
// 새로운:
const supabase = createClient()
await supabase.auth.signOut()
```

### Phase 8: NextAuth 제거 및 정리
1. `@bluenote/auth` 패키지 의존성 제거
2. NextAuth 관련 파일 삭제
   - `/api/auth/[...nextauth]/route.ts`
   - NextAuth 설정 파일들
3. 불필요한 환경 변수 제거
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET

## 파일별 변경 사항

### 변경 필요 파일 목록

#### 1. API Routes (약 20개 파일)
- `/api/assignments/**/*.ts`
- `/api/evaluations/**/*.ts`
- `/api/templates/**/*.ts`
- `/api/admin/**/*.ts`
- 각 파일에서 `getServerSession` → `getSession` 변경

#### 2. Client Components
- `src/components/Providers.tsx`
- `src/components/AuthLayout.tsx`
- `src/components/AuthSyncProvider.tsx`
- `src/contexts/UserContext.tsx`

#### 3. Library Files
- `src/lib/auth.ts` → `src/lib/supabase-auth.ts`로 대체
- `src/lib/assignment-auth.ts` - 권한 체크 로직 수정

#### 4. Middleware
- `src/middleware.ts` - 인증 체크 로직 변경

## 주의사항

1. **데이터 마이그레이션 불필요**
   - Supabase Auth 사용자는 이메일 기반으로 매칭
   - user_permissions 테이블은 그대로 유지

2. **권한 체크 로직 유지**
   - user_permissions 테이블 기반 권한 체크는 그대로
   - Service Role Key로 RLS 우회

3. **세션 동기화**
   - Supabase Auth 세션과 user_permissions 동기화 필요
   - 로그인 시 user_permissions 확인 로직 추가

4. **테스트 필수**
   - 각 API 엔드포인트 테스트
   - 권한 체크 로직 테스트
   - 로그인/로그아웃 플로우 테스트

## 롤백 계획

문제 발생 시 git revert로 이전 상태로 복구:
```bash
git revert HEAD~n  # n은 커밋 수
```

## 예상 소요 시간

- Phase 1-2: 30분 (설정)
- Phase 3-4: 2시간 (API 라우트 변경)
- Phase 5: 1시간 (클라이언트 컴포넌트)
- Phase 6-7: 1시간 (권한 및 인증 플로우)
- Phase 8: 30분 (정리)
- 테스트: 1시간

**총 예상 시간: 약 6시간**

## 체크리스트

- [ ] 의존성 설치
- [ ] 환경 변수 확인
- [ ] Supabase Auth 클라이언트 설정
- [ ] 미들웨어 마이그레이션
- [ ] API 라우트 인증 변경 (20개 파일)
- [ ] 클라이언트 컴포넌트 변경
- [ ] 로그인/로그아웃 플로우 구현
- [ ] user_permissions 동기화 확인
- [ ] NextAuth 제거
- [ ] 전체 테스트
- [ ] 문서 업데이트