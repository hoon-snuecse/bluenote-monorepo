#!/bin/bash

echo "🚀 BlueNote 모노레포 마이그레이션 시작..."

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
MONOREPO_DIR="/Users/hoon/bluenote-monorepo"
BLUENOTE_DIR="/Users/hoon/BlueNote/my-claude-app"
GRADING_DIR="/Users/hoon/grading/grading-app"

echo -e "${BLUE}📁 모노레포 디렉토리: $MONOREPO_DIR${NC}"

# 1. 기본 파일 복사
echo -e "\n${GREEN}1. 기본 설정 파일 복사...${NC}"
cp package.json "$MONOREPO_DIR/"
cp pnpm-workspace.yaml "$MONOREPO_DIR/"
cp turbo.json "$MONOREPO_DIR/"
cp .gitignore "$MONOREPO_DIR/"
cp README.md "$MONOREPO_DIR/"

# 2. 디렉토리 구조 생성
echo -e "\n${GREEN}2. 디렉토리 구조 생성...${NC}"
mkdir -p "$MONOREPO_DIR/apps/web"
mkdir -p "$MONOREPO_DIR/apps/grading"
mkdir -p "$MONOREPO_DIR/packages"

# 3. packages 복사
echo -e "\n${GREEN}3. 공통 패키지 복사...${NC}"
cp -r packages/* "$MONOREPO_DIR/packages/"

# 4. bluenote.site 복사
echo -e "\n${GREEN}4. bluenote.site 프로젝트 복사...${NC}"
if [ -d "$BLUENOTE_DIR" ]; then
    cp -r "$BLUENOTE_DIR/"* "$MONOREPO_DIR/apps/web/"
    echo "   ✅ bluenote.site 복사 완료"
else
    echo "   ⚠️  bluenote.site 디렉토리를 찾을 수 없습니다: $BLUENOTE_DIR"
fi

# 5. grading-app 복사
echo -e "\n${GREEN}5. grading-app 프로젝트 복사...${NC}"
if [ -d "$GRADING_DIR" ]; then
    # monorepo-setup 디렉토리는 제외하고 복사
    rsync -av --exclude='monorepo-setup' "$GRADING_DIR/" "$MONOREPO_DIR/apps/grading/"
    echo "   ✅ grading-app 복사 완료"
else
    echo "   ⚠️  grading-app 디렉토리를 찾을 수 없습니다: $GRADING_DIR"
fi

echo -e "\n${GREEN}✨ 마이그레이션 준비 완료!${NC}"
echo -e "\n다음 단계:"
echo "1. cd $MONOREPO_DIR"
echo "2. pnpm install"
echo "3. pnpm dev"