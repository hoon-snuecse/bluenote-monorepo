#!/bin/bash

# 퀴즈 공유 취소 스크립트
# Quiz ID: 1ea9e972-a363-44b8-9fee-1bd6158e67dc (백범일지)

echo "퀴즈 공유를 취소합니다..."

# 1. 먼저 세션을 가져와서 인증된 상태인지 확인
SESSION_RESPONSE=$(curl -s http://localhost:3003/api/auth/session)
echo "Session check: $SESSION_RESPONSE"

# 2. DELETE 요청으로 공유 취소
curl -X DELETE http://localhost:3003/api/quizzes/1ea9e972-a363-44b8-9fee-1bd6158e67dc/share \
  -H "Content-Type: application/json" \
  -H "Cookie: $(curl -s -I http://localhost:3003 | grep -i set-cookie | cut -d' ' -f2)"

echo ""
echo "완료!"