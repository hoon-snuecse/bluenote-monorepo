#!/bin/bash

echo "🧹 환경 파일 정리 스크립트"
echo "=========================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 백업 디렉토리 생성
BACKUP_DIR="env-backup-cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "\n${YELLOW}1. 현재 환경 파일 구조${NC}"
echo "루트 레벨:"
ls -la .env* 2>/dev/null || echo "  (없음)"

echo -e "\nWeb 앱:"
ls -la apps/web/.env* 2>/dev/null || echo "  (없음)"

echo -e "\nGrading 앱:"
ls -la apps/grading/.env* 2>/dev/null || echo "  (없음)"

echo -e "\n${YELLOW}2. 루트 레벨 환경 파일 백업${NC}"
if [ -f ".env" ]; then
  cp .env "$BACKUP_DIR/"
  echo -e "${GREEN}✓ .env 백업 완료${NC}"
fi

if [ -f ".env.local" ]; then
  cp .env.local "$BACKUP_DIR/"
  echo -e "${GREEN}✓ .env.local 백업 완료${NC}"
fi

echo -e "\n${YELLOW}3. 정리 작업${NC}"
echo -e "${RED}주의: 루트 레벨의 .env 파일들은 monorepo에서 사용되지 않습니다.${NC}"
echo -e "각 앱은 자체 .env.local 파일을 사용합니다:"
echo "  - apps/web/.env.local"
echo "  - apps/grading/.env.local"

echo -e "\n${YELLOW}권장 작업:${NC}"
echo "1. 루트의 .env.local 삭제 (백업은 $BACKUP_DIR에 저장됨)"
echo "   rm .env.local"
echo ""
echo "2. 필요시 .env를 .env.example로 변경 (템플릿용)"
echo "   mv .env .env.example"
echo ""
echo "3. .gitignore 확인"
echo "   - /.env.local (루트) 제거"
echo "   - /apps/*/.env.local 유지"

echo -e "\n${YELLOW}4. Vercel 프로젝트 확인${NC}"
echo "각 앱이 올바른 디렉토리를 가리키는지 확인:"
echo "- Web: https://vercel.com/your-team/bluenote-web/settings/general"
echo "  Root Directory: apps/web"
echo "- Grading: https://vercel.com/your-team/bluenote-grading/settings/general"
echo "  Root Directory: apps/grading"