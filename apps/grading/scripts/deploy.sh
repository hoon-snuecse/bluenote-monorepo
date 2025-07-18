#!/bin/bash

# Bluenote Grading 배포 스크립트
# 사용법: ./scripts/deploy.sh [환경] [옵션]
# 예시: ./scripts/deploy.sh production --skip-tests

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 변수
ENVIRONMENT=${1:-production}
SKIP_TESTS=${2:-false}

# 로그 함수
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 환경 확인
log "배포 환경: $ENVIRONMENT"

# 사전 체크
log "사전 체크 시작..."

# Node.js 버전 확인
NODE_VERSION=$(node -v)
log "Node.js 버전: $NODE_VERSION"

# pnpm 확인
if ! command -v pnpm &> /dev/null; then
    error "pnpm이 설치되어 있지 않습니다. 'npm install -g pnpm'을 실행하세요."
fi

# 환경 변수 파일 확인
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f ".env.production" ]; then
        error ".env.production 파일이 없습니다. .env.production.example을 참고하여 생성하세요."
    fi
    log "프로덕션 환경 변수 파일 확인 완료"
fi

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    warning "커밋되지 않은 변경사항이 있습니다."
    read -p "계속하시겠습니까? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 의존성 설치
log "의존성 설치 중..."
pnpm install --frozen-lockfile

# 환경 변수 검증
log "환경 변수 검증 중..."
node -e "require('./src/config').checkRequiredEnvVars()" || error "환경 변수 검증 실패"

# 테스트 실행
if [ "$SKIP_TESTS" != "--skip-tests" ]; then
    log "테스트 실행 중..."
    pnpm test --filter=grading || warning "일부 테스트가 실패했습니다."
fi

# 린트 실행
log "코드 린트 실행 중..."
pnpm lint --filter=grading

# 타입 체크
log "TypeScript 타입 체크 중..."
pnpm tsc --noEmit

# 빌드
log "애플리케이션 빌드 중..."
pnpm build --filter=grading

# 빌드 성공 확인
if [ ! -d ".next" ]; then
    error "빌드 실패: .next 디렉토리가 생성되지 않았습니다."
fi

# 데이터베이스 마이그레이션
if [ "$ENVIRONMENT" = "production" ]; then
    log "데이터베이스 마이그레이션 확인 중..."
    pnpm prisma migrate status
    
    read -p "데이터베이스 마이그레이션을 실행하시겠습니까? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "데이터베이스 마이그레이션 실행 중..."
        pnpm prisma migrate deploy
    fi
fi

# Vercel 배포
if command -v vercel &> /dev/null; then
    log "Vercel로 배포 중..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
else
    warning "Vercel CLI가 설치되어 있지 않습니다."
    log "수동으로 배포하거나 'npm i -g vercel'로 설치하세요."
fi

# 배포 후 확인
log "배포 후 확인 작업..."

# 헬스 체크 (30초 대기)
log "30초 후 헬스 체크를 실행합니다..."
sleep 30

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://grading.bluenote.site/api/health"
else
    HEALTH_URL="https://grading-staging.bluenote.site/api/health"
fi

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ "$HEALTH_CHECK" = "200" ]; then
    log "헬스 체크 성공!"
else
    error "헬스 체크 실패: HTTP $HEALTH_CHECK"
fi

# 완료
log "🎉 배포가 성공적으로 완료되었습니다!"
log "배포 환경: $ENVIRONMENT"
log "URL: $HEALTH_URL"

# 배포 로그 저장
DEPLOY_LOG="deploy-$(date +'%Y%m%d-%H%M%S').log"
log "배포 로그가 $DEPLOY_LOG에 저장되었습니다."