#!/bin/bash

# 환경 변수 업데이트 스크립트
# 사용법: ./scripts/update-env-vars.sh

echo "🔑 환경 변수 업데이트 도구"
echo "=========================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 환경 변수 파일 목록
ENV_FILES=(
  "apps/web/.env.local"
  "apps/grading/.env.local"
)

# 백업 디렉토리 생성
BACKUP_DIR="env-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}1. 현재 환경 변수 파일 백업 중...${NC}"
for file in "${ENV_FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ $file 백업 완료${NC}"
  fi
done

echo -e "\n${YELLOW}2. 새로운 API 키 입력${NC}"
echo "각 키를 입력하거나 Enter를 눌러 건너뛰세요."

# Anthropic API Key
echo -n "새로운 ANTHROPIC_API_KEY (sk-ant-로 시작): "
read -r NEW_ANTHROPIC_KEY

# Google Client Secret
echo -n "새로운 GOOGLE_CLIENT_SECRET: "
read -r NEW_GOOGLE_SECRET

# Supabase 비밀번호
echo -n "새로운 Supabase 데이터베이스 비밀번호: "
read -r NEW_SUPABASE_PASSWORD

echo -e "\n${YELLOW}3. 환경 변수 파일 업데이트 중...${NC}"

# Web 앱 업데이트
if [ -n "$NEW_ANTHROPIC_KEY" ] && [ -f "apps/web/.env.local" ]; then
  sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$NEW_ANTHROPIC_KEY/" apps/web/.env.local
  echo -e "${GREEN}✓ Web 앱 ANTHROPIC_API_KEY 업데이트${NC}"
fi

if [ -n "$NEW_GOOGLE_SECRET" ] && [ -f "apps/web/.env.local" ]; then
  sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$NEW_GOOGLE_SECRET/" apps/web/.env.local
  echo -e "${GREEN}✓ Web 앱 GOOGLE_CLIENT_SECRET 업데이트${NC}"
fi

# Grading 앱 업데이트
if [ -n "$NEW_ANTHROPIC_KEY" ] && [ -f "apps/grading/.env.local" ]; then
  sed -i.bak "s/CLAUDE_API_KEY=.*/CLAUDE_API_KEY=$NEW_ANTHROPIC_KEY/" apps/grading/.env.local
  echo -e "${GREEN}✓ Grading 앱 CLAUDE_API_KEY 업데이트${NC}"
fi

if [ -n "$NEW_GOOGLE_SECRET" ] && [ -f "apps/grading/.env.local" ]; then
  sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$NEW_GOOGLE_SECRET/" apps/grading/.env.local
  echo -e "${GREEN}✓ Grading 앱 GOOGLE_CLIENT_SECRET 업데이트${NC}"
fi

# Supabase 업데이트 (DATABASE_URL에서)
if [ -n "$NEW_SUPABASE_PASSWORD" ]; then
  for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
      # DATABASE_URL에서 비밀번호 부분만 변경
      sed -i.bak "s/\(postgresql:\/\/postgres:\)[^@]*\(@\)/\1$NEW_SUPABASE_PASSWORD\2/" "$file"
      echo -e "${GREEN}✓ $file의 DATABASE_URL 비밀번호 업데이트${NC}"
    fi
  done
fi

echo -e "\n${YELLOW}4. Vercel 환경 변수 업데이트 명령어${NC}"
echo "다음 명령어를 실행하여 Vercel에 환경 변수를 업데이트하세요:"
echo ""
if [ -n "$NEW_ANTHROPIC_KEY" ]; then
  echo -e "${GREEN}# Anthropic API Key 업데이트${NC}"
  echo "vercel env rm ANTHROPIC_API_KEY production"
  echo "echo '$NEW_ANTHROPIC_KEY' | vercel env add ANTHROPIC_API_KEY production"
  echo ""
fi
if [ -n "$NEW_GOOGLE_SECRET" ]; then
  echo -e "${GREEN}# Google Client Secret 업데이트${NC}"
  echo "vercel env rm GOOGLE_CLIENT_SECRET production"
  echo "echo '$NEW_GOOGLE_SECRET' | vercel env add GOOGLE_CLIENT_SECRET production"
  echo ""
fi

echo -e "\n${YELLOW}5. 완료!${NC}"
echo -e "백업 파일은 ${GREEN}$BACKUP_DIR${NC}에 저장되었습니다."
echo -e "${RED}주의: .bak 파일들을 삭제하는 것을 잊지 마세요!${NC}"
echo "rm apps/*/.env.local.bak"