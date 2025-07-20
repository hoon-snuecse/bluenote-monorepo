#!/bin/bash

# Vercel Deploy Hook Script
# 
# 사용법:
# 1. Vercel 대시보드에서 Deploy Hook URL 생성:
#    - Settings > Git > Deploy Hooks
#    - "Create Hook" 클릭
#    - Hook 이름 입력 (예: "Manual Deploy")
#    - 생성된 URL 복사
#
# 2. 아래 DEPLOY_HOOK_URL에 복사한 URL 붙여넣기
# 3. 실행: bash scripts/deploy-hook.sh

DEPLOY_HOOK_URL="YOUR_VERCEL_DEPLOY_HOOK_URL_HERE"

# Deploy Hook URL이 설정되었는지 확인
if [ "$DEPLOY_HOOK_URL" = "YOUR_VERCEL_DEPLOY_HOOK_URL_HERE" ]; then
    echo "❌ Error: Deploy Hook URL이 설정되지 않았습니다."
    echo "Vercel 대시보드에서 Deploy Hook을 생성하고 URL을 이 스크립트에 추가하세요."
    exit 1
fi

echo "🚀 Vercel 배포를 시작합니다..."

# Deploy Hook 호출
response=$(curl -X POST "$DEPLOY_HOOK_URL" -w "\n%{http_code}" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
    echo "✅ 배포가 성공적으로 시작되었습니다!"
    echo "📋 응답: $body"
    echo ""
    echo "🔗 Vercel 대시보드에서 배포 진행 상황을 확인하세요:"
    echo "   https://vercel.com/dashboard"
else
    echo "❌ 배포 시작 실패 (HTTP $http_code)"
    echo "📋 응답: $body"
    exit 1
fi