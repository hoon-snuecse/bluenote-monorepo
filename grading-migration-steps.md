# Grading 앱 마이그레이션 단계

## 1. Prisma 마이그레이션 생성 및 실행

```bash
# grading 앱 디렉토리로 이동
cd apps/grading

# 마이그레이션 생성
pnpm prisma migrate dev --name add_sample_fields

# 데이터베이스에 마이그레이션 적용
pnpm prisma migrate deploy

# Prisma Client 재생성
pnpm prisma generate
```

## 2. 샘플 데이터 삽입

`apps/grading/prisma/seed-samples.ts` 파일을 생성하고 실행:

```bash
# seed 파일 실행
pnpm tsx prisma/seed-samples.ts
```

## 3. 환경변수 확인

`.env.local` 파일에 다음 변수가 있는지 확인:
- `DATABASE_URL` (SQLite 경로)
- 또는 Supabase 연결 정보

## 4. 테스트

```bash
# 개발 서버 실행
pnpm dev --filter=grading

# http://localhost:3001 에서 샘플 과제 확인
```