# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 레포지토리의 코드를 작업할 때 참고할 가이드입니다.

## Version: 0.2.0 (2025-01-08)

### v0.2 변경사항
- **인증 통합**: @bluenote/supabase-auth 패키지로 통합 인증 구현
- **Navigation 컴포넌트**: 로그인 상태를 올바르게 표시하도록 수정
- **세션 관리**: 크로스 도메인 쿠키 공유로 *.bluenote.site 전체에서 인증 유지
- **API 엔드포인트**: session-check 및 auth callback 라우트 추가
- **환경 설정**: 포트 3003으로 설정 및 환경변수 구성 완료

## 프로젝트 개요

Kahoot 퀴즈 메이커 - 교사들이 AI의 도움을 받아 Kahoot용 대화형 퀴즈 템플릿을 생성, 공유, 다운로드할 수 있는 플랫폼

### 시스템 목표
- 맞춤형 매개변수로 AI 지원 퀴즈 생성 가능
- Kahoot 호환 형식(CSV/Excel)으로 내보내기 지원
- 퀴즈 자료 공유를 위한 교사 커뮤니티 제공
- 정답과 해설이 포함된 종합 교사 가이드 생성

## 주요 개발 명령어

```bash
# 의존성 설치 (monorepo 루트에서)
pnpm install

# 개발 서버 실행 (포트 3003)
pnpm dev --filter=quiz

# 프로덕션 빌드
pnpm build --filter=quiz

# 린팅 실행
pnpm lint --filter=quiz

# 코드 포맷팅
pnpm format

# 의존성 추가
pnpm add <package> --filter=quiz
```

## 기술 스택

- **프레임워크**: Next.js 15.3.5 (App Router)
- **런타임**: React 19 with JavaScript
- **스타일링**: Tailwind CSS v3 (@bluenote/config 통해)
- **UI 컴포넌트**: @bluenote/ui (공유 컴포넌트 라이브러리)
- **인증**: @bluenote/supabase-auth (통합 인증 패키지 v0.2)
- **데이터베이스**: Supabase (PostgreSQL) with RLS
- **AI 통합**: Claude API (Anthropic)
- **아이콘**: Lucide React
- **개발 포트**: 3003

## 프로젝트 구조

```
apps/quiz/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── layout.js          # 탭 네비게이션이 있는 루트 레이아웃
│   │   ├── page.js            # 메인 랜딩/리다이렉트 페이지
│   │   ├── (auth)/            # 인증 페이지
│   │   │   ├── signin/
│   │   │   └── error/
│   │   ├── (quiz)/            # 퀴즈 앱 페이지
│   │   │   ├── create/        # 퀴즈 생성 탭
│   │   │   ├── my-quizzes/    # 사용자 퀴즈 라이브러리
│   │   │   └── community/     # 커뮤니티 퀴즈 공유
│   │   └── api/               # API 라우트
│   │       ├── auth/          # Supabase Auth 엔드포인트 (v0.2)
│   │       ├── quizzes/       # 퀴즈 CRUD 작업
│   │       ├── ai/            # Claude AI 통합
│   │       ├── export/        # 파일 내보내기 엔드포인트
│   │       └── share/         # 커뮤니티 공유
│   ├── components/            # React 컴포넌트
│   │   ├── QuizBuilder/       # 퀴즈 생성 컴포넌트
│   │   ├── QuestionPreview/   # 문항 미리보기/선택
│   │   ├── Export/            # 내보내기 모달 & 옵션
│   │   ├── Navigation/        # 탭 네비게이션
│   │   └── Community/         # 커뮤니티 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   │   ├── auth.js           # @bluenote/supabase-auth 통합 (v0.2)
│   │   ├── supabase.js       # 데이터베이스 클라이언트
│   │   ├── claude-api.js     # AI 문항 생성
│   │   ├── kahoot-exporter.js # CSV/Excel 내보내기
│   │   └── html-generator.js  # 교사 가이드 생성
│   └── middleware.js          # 인증 미들웨어
├── package.json               # 의존성
├── jsconfig.json             # 경로 별칭
├── tailwind.config.js        # @bluenote/config 확장
├── next.config.js            # Next.js 설정
└── .env.local                # 환경 변수
```

## 핵심 기능 및 구현

### 1. 탭 기반 인터페이스
**3개의 주요 탭**:
- **📝 퀴즈 생성**: AI 기반 퀴즈 빌더
- **💾 퀴즈 저장**: 개인 퀴즈 라이브러리
- **🌍 커뮤니티**: 공유 퀴즈 마켓플레이스

### 2. 퀴즈 생성 워크플로우
1. **주제 입력**: 교사가 과목/주제/책이름 입력
2. **AI 생성**: Claude가 정답과 해설이 포함된 문항 생성
3. **미리보기 및 선택**: 교사가 문항 검토 및 선택
4. **내보내기 및 저장**: 파일 다운로드 및 선택적으로 커뮤니티 공유

### 3. 문항 유형
- **OX형**: 2개 선택지, 기본 20초
- **4지선다형**: 4개 선택지, 기본 30초

### 4. 내보내기 형식
- **Kahoot 퀴즈 파일**: 적절한 컬럼 구조의 CSV/Excel
- **교사 가이드**: 문항, 정답, 해설이 포함된 HTML
- **인쇄 친화적 PDF**: A4 최적화 레이아웃 (향후 기능)

## 아키텍처 및 패턴

### 인증 플로우 (v0.2)
```javascript
// @bluenote/supabase-auth 사용 (v0.2 업데이트)
import { useSupabaseAuth } from '@bluenote/supabase-auth'

// 클라이언트 사이드
const { user, session, loading, signInWithGoogle, signOut } = useSupabaseAuth()

// 서버 사이드 (Route Handlers)
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'

// RLS 정책은 이메일 기반 접근 제어 사용
current_setting('app.current_user_email', true)
```

### 데이터베이스 접근 패턴
```javascript
// Supabase 클라이언트 직접 사용 (web 앱 패턴 따름)
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const { data, error } = await supabase
  .from('quizzes')
  .select('*')
  .eq('user_id', userId)
```

### API 응답 형식
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

### 컴포넌트 구조
```javascript
// 훅을 사용하는 함수형 컴포넌트
export default function QuizBuilder() {
  // 1. 인증 확인 (v0.2)
  const { user, session } = useSupabaseAuth()
  
  // 2. 상태 관리
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  
  // 3. API 호출
  const generateQuestions = async () => {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ topic })
    })
  }
  
  // 4. 렌더링
  return <div>...</div>
}
```

## 코드 컨벤션

### JavaScript 표준
- 함수형 컴포넌트만 사용
- 상태 관리는 React 훅 사용
- 비동기 작업은 async/await 사용
- props와 state는 구조 분해 할당 사용

### 명명 규칙
- **컴포넌트**: PascalCase (`QuizBuilder.js`)
- **함수**: camelCase (`generateQuestions`)
- **API 라우트**: kebab-case (`/api/quiz-exports`)
- **데이터베이스**: snake_case (`quiz_downloads`)

### 임포트 순서
1. React/Next.js 임포트
2. 서드파티 라이브러리
3. @bluenote 패키지
4. 로컬 컴포넌트
5. 유틸리티 및 헬퍼
6. 스타일

### 주석
- 비즈니스 로직은 한글 주석
- 기술적 구현은 영어 주석
- 컴포넌트 props는 JSDoc 사용

## 환경 변수

```bash
# 퀴즈 앱 필수 환경 변수
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3003
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLAUDE_API_KEY=
ANTHROPIC_API_KEY=
```

## 데이터베이스 스키마 주요 사항

### 주요 테이블
- `users`: NextAuth 세션과 통합
- `quizzes`: 사용자의 퀴즈 컬렉션
- `questions`: 개별 퀴즈 문항
- `question_options`: 답변 선택지
- `shared_quizzes`: 커뮤니티 공유 퀴즈
- `quiz_downloads`: 다운로드 추적
- `quiz_ratings`: 커뮤니티 평가

### RLS 정책
모든 테이블은 이메일 기반 접근 제어 사용:
```sql
current_setting('app.current_user_email', true)
```

## 통합 지점

### 다른 앱과의 통합
- **인증**: @bluenote/auth 설정 공유
- **UI 컴포넌트**: @bluenote/ui 컴포넌트 사용
- **설정**: @bluenote/config에서 상속

### 포트
- **Web 앱**: 3000
- **Grading 앱**: 3002
- **Quiz 앱**: 3003 (이 앱)

## 개발 워크플로우

1. **개발 시작**: 
   ```bash
   pnpm dev --filter=quiz
   ```

2. **앱 접속**: http://localhost:3003

3. **인증 테스트**: Google OAuth로 로그인

4. **데이터베이스 마이그레이션**: Supabase 대시보드에서 실행

5. **컴포넌트 개발**: @bluenote/ui 컴포넌트 재사용

## 중요 사항

1. **한국어 UI**: 모든 사용자 대면 텍스트는 한국어로
2. **Kahoot 제한사항**: 
   - 질문: 최대 95자
   - 선택지: 최대 60자
   - 시간: 10-60초
3. **내보내기 우선순위**: Kahoot 업로드용 CSV/Excel
4. **커뮤니티 기능**: 평점과 함께 공개 공유
5. **모바일 우선**: 반응형 디자인 필수
6. **데이터베이스 통합**:
   - 기존 auth.users 테이블 사용 (별도 users 테이블 생성 금지)
   - 파일 저장은 Supabase Storage 활용
   - JSONB 타입으로 유연한 메타데이터 저장
   - 일일 통계는 별도 테이블로 관리

## 일반적인 작업

### 새 API 엔드포인트 추가하기 (v0.2)
```javascript
// app/api/[endpoint]/route.js
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createRouteHandlerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 여기에 로직 작성
  return NextResponse.json({ data: result })
}
```

### 공유 UI 컴포넌트 사용하기
```javascript
import { Card, CardHeader, CardTitle, CardContent } from '@bluenote/ui'

export default function QuizCard({ quiz }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {quiz.description}
      </CardContent>
    </Card>
  )
}
```

### RLS 인식 쿼리 구현하기
```javascript
// RLS를 위한 세션 컨텍스트 설정
await supabase.rpc('set_current_user_email', { 
  email: session.user.email 
})

// 그 다음 정상적으로 쿼리
const { data, error } = await supabase
  .from('quizzes')
  .select('*')
```

## 배포 체크리스트

- [ ] Vercel에 환경 변수 설정
- [ ] 데이터베이스 마이그레이션 적용
- [ ] RLS 정책 검증
- [ ] Google OAuth 콜백 URL 업데이트
- [ ] Monorepo 빌드 설정 테스트
- [ ] 도메인 DNS 설정 (quiz.bluenote.site)