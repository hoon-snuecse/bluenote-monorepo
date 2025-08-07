#!/bin/bash

# Grading 앱의 모든 API 라우트에서 인증 로직 마이그레이션
# NextAuth -> Supabase Auth

echo "Starting auth migration for Grading app..."

# API 라우트 디렉토리
API_DIR="src/app/api"

# 변경할 패턴들
# 1. import 문 변경
find $API_DIR -name "*.ts" -type f | while read file; do
  echo "Processing $file..."
  
  # getServerSession import 변경
  sed -i '' "s/import { getServerSession } from '@\/lib\/auth'/import { getSessionWithPermissions } from '@\/lib\/auth-helpers'/g" "$file"
  
  # getSession import 변경 (alias 사용 시)
  sed -i '' "s/import { getSession } from '@\/lib\/auth'/import { getSessionWithPermissions } from '@\/lib\/auth-helpers'/g" "$file"
  
  # 함수 호출 변경 (권한 정보도 함께 가져오도록)
  sed -i '' "s/await getServerSession()/await getSessionWithPermissions()/g" "$file"
  sed -i '' "s/await getSession()/await getSessionWithPermissions()/g" "$file"
done

echo "Auth migration completed!"
echo "Please review the changes and test thoroughly."