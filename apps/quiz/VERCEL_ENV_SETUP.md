# Vercel 환경변수 설정 가이드

## 필수 환경변수

Quiz 앱이 프로덕션에서 정상 작동하려면 Vercel 프로젝트 설정에서 다음 환경변수들을 설정해야 합니다:

### 1. Supabase 설정 (필수)
```bash
# Public 환경변수 (클라이언트에서 사용)
NEXT_PUBLIC_SUPABASE_URL=https://ukxchcyvxnbmsfrsamjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (서버에서만 사용 - 매우 중요\!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **중요**: `SUPABASE_SERVICE_ROLE_KEY`가 없으면 퀴즈 저장 시 "permission denied" 오류가 발생합니다.

### 2. NextAuth 설정
```bash
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://quiz.bluenote.site
```

### 3. Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 4. Claude API (선택사항)
```bash
ANTHROPIC_API_KEY=sk-ant-api...
```

## Vercel에서 환경변수 설정하기

1. [Vercel Dashboard](https://vercel.com)에 로그인
2. Quiz 프로젝트 선택
3. Settings → Environment Variables로 이동
4. 각 변수를 추가:
   - Key: 환경변수 이름
   - Value: 환경변수 값
   - Environment: Production, Preview, Development 모두 체크

## Service Role Key 얻는 방법

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. Settings → API로 이동
4. "Service Role Key" 섹션에서 키 복사
   - ⚠️ 이 키는 매우 민감한 정보입니다. 절대 클라이언트 코드나 공개 저장소에 포함시키지 마세요.

## 설정 후 확인

환경변수 설정 후:
1. Vercel에서 재배포 트리거
2. 배포 완료 후 테스트
3. 퀴즈 저장 기능이 정상 작동하는지 확인

## 문제 해결

### "permission denied for table quizzes" 오류
- 원인: `SUPABASE_SERVICE_ROLE_KEY`가 설정되지 않음
- 해결: Vercel 환경변수에 Service Role Key 추가

### "Server configuration error" 오류
- 원인: 환경변수가 제대로 설정되지 않음
- 해결: Vercel Dashboard에서 모든 필수 환경변수 확인

## 보안 참고사항

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용됩니다
- 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요
- 이 키를 가진 사람은 RLS를 우회하여 모든 데이터에 접근할 수 있습니다
EOF < /dev/null