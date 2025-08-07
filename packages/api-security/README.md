# @bluenote/api-security

Bluenote monorepo를 위한 공통 API 보안 유틸리티 패키지

## 설치

```bash
pnpm add @bluenote/api-security
```

## 주요 기능

- 🔐 **인증 미들웨어**: JWT 토큰 검증 및 사용자 인증
- 🚫 **권한 검사**: 역할 기반 접근 제어 (RBAC)
- ✅ **입력 검증**: Zod를 사용한 스키마 검증
- 🧨 **사니타이징**: XSS 공격 방지를 위한 입력 정제
- ⏱️ **Rate Limiting**: API 요청 제한
- 🛡️ **보안 헤더**: CORS, CSP 등 보안 헤더 설정

## 사용법

### 인증 미들웨어

```javascript
import { requireAuth, withAuth } from '@bluenote/api-security/middleware'

// 필수 인증
export default requireAuth(async (req, res) => {
  // req.user에 인증된 사용자 정보가 들어있음
  res.json({ user: req.user })
})

// 선택적 인증
export default withAuth(async (req, res) => {
  if (req.user) {
    // 로그인한 사용자
  } else {
    // 비로그인 사용자
  }
})
```

### 권한 검사

```javascript
import { requirePermission } from '@bluenote/api-security/middleware'

// 특정 권한이 필요한 API
export default requirePermission('admin')(
  async (req, res) => {
    // 관리자만 접근 가능
  }
)

// 여러 권한 중 하나만 있어도 통과
export default requirePermission(['admin', 'moderator'])(
  async (req, res) => {
    // 관리자 또는 모더레이터 접근 가능
  }
)
```

### 입력 검증

```javascript
import { validateRequest, commonSchemas } from '@bluenote/api-security/validators'
import { z } from 'zod'

// 커스텀 스키마 정의
const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  tags: z.array(z.string()).optional()
})

export default async (req, res) => {
  try {
    // 요청 데이터 검증
    const data = validateRequest(createPostSchema, req.body)
    // data는 타입 안전하고 검증된 데이터
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
```

### 사니타이징

```javascript
import { sanitizeInput } from '@bluenote/api-security/validators'

// 사용자 입력 정제
const cleanInput = sanitizeInput(userInput)
// HTML 태그, Script 태그, XSS 패턴이 제거됨
```

### Rate Limiting

```javascript
import { rateLimit, apiRateLimit } from '@bluenote/api-security/rate-limit'

// 기본 rate limiter (15분당 100회)
export default rateLimit(async (req, res) => {
  // API 로직
})

// API 전용 rate limiter (1분당 30회)
export default apiRateLimit(async (req, res) => {
  // API 로직
})
```

### 보안 헤더

```javascript
import { securityHeaders } from '@bluenote/api-security'

// Next.js API Route
export default async (req, res) => {
  // 보안 헤더 설정
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  
  // API 로직
}
```

## 에러 클래스

```javascript
import { 
  SecurityError, 
  AuthError, 
  PermissionError, 
  ValidationError,
  RateLimitError 
} from '@bluenote/api-security'

try {
  // ...
} catch (error) {
  if (error instanceof AuthError) {
    // 인증 에러 (401)
  } else if (error instanceof PermissionError) {
    // 권한 에러 (403)
  } else if (error instanceof ValidationError) {
    // 검증 에러 (400)
    console.log(error.errors) // 상세 에러 정보
  } else if (error instanceof RateLimitError) {
    // Rate limit 에러 (429)
    console.log(error.retryAfter) // 재시도 가능 시간
  }
}
```

## 각 앱에서의 통합

각 앱에서 `validateToken` 함수를 구현하여 사용:

```javascript
// apps/web/lib/api-security.js
import { createClient } from '@bluenote/supabase-auth'

export async function validateToken(token) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new AuthError('유효하지 않은 토큰')
  }
  
  return user
}
```

## 라이선스

MIT