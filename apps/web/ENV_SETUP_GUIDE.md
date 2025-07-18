# 🚨 환경변수 설정 가이드

## 문제
`ADMIN_EMAILS` 환경변수가 설정되지 않아 관리자 권한이 작동하지 않습니다.

## 해결 방법

### 옵션 1: 로컬 개발 환경 (.env.local)

1. `/apps/web/.env.local` 파일 열기
2. 다음 줄 추가:
```
ADMIN_EMAILS=hoon@snuecse.org
```
3. 개발 서버 재시작:
```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

### 옵션 2: Vercel 배포 환경

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 해당 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 새 변수 추가:
   - **Key**: `ADMIN_EMAILS`
   - **Value**: `hoon@snuecse.org`
   - **Environment**: 모두 선택 (Production, Preview, Development)
5. **Save** 클릭
6. **중요**: Deployments 탭에서 **Redeploy** 필수!

### 옵션 3: 다른 호스팅 서비스

환경변수 설정 방법은 호스팅 서비스마다 다릅니다:
- **Netlify**: Site settings → Environment variables
- **Heroku**: Settings → Config Vars
- **AWS**: Elastic Beanstalk Configuration

## 확인 방법

1. 환경변수 설정 후 로그아웃
2. 다시 로그인
3. `/check-env` 페이지에서 확인:
   - ADMIN_EMAILS 설정: **있음**
   - hoon@snuecse.org 포함: **예**
   - 관리자 이메일 개수: **1**

## 여러 관리자 추가

콤마로 구분하여 여러 이메일 추가 가능:
```
ADMIN_EMAILS=hoon@snuecse.org,admin2@example.com,admin3@example.com
```

## 주의사항

- 환경변수 값에 공백이 없도록 주의
- 이메일 주소는 정확히 입력 (대소문자 구분)
- Vercel의 경우 반드시 Redeploy 필요