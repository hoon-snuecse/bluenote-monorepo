#!/bin/bash

# 이미지 디렉토리로 이동
cd /Users/hoon/bluenote-monorepo/apps/grading/docs/user-guide/images

echo "이미지 파일명 변경을 시작합니다..."

# 1. bluenote.png를 01-bluenote.png로
if [ -f "bluenote.png" ]; then
    mv "bluenote.png" "01-bluenote.png"
    echo "✓ bluenote.png → 01-bluenote.png"
fi

# 2. 기존 01-login-page.png를 02-login-page.png로
if [ -f "01-login-page.png" ]; then
    mv "01-login-page.png" "02-login-page.png"
    echo "✓ 01-login-page.png → 02-login-page.png"
fi

# 3. Google OAuth 과정 이미지들
if [ -f "01-login-page-1.png" ]; then
    mv "01-login-page-1.png" "03-login-google-1.png"
    echo "✓ 01-login-page-1.png → 03-login-google-1.png"
fi

if [ -f "01-login-page-2.png" ]; then
    mv "01-login-page-2.png" "04-login-google-2.png"
    echo "✓ 01-login-page-2.png → 04-login-google-2.png"
fi

if [ -f "01-login-page-3.png" ]; then
    mv "01-login-page-3.png" "05-login-google-3.png"
    echo "✓ 01-login-page-3.png → 05-login-google-3.png"
fi

if [ -f "01-login-page-4.png" ]; then
    mv "01-login-page-4.png" "06-login-google-4.png"
    echo "✓ 01-login-page-4.png → 06-login-google-4.png"
fi

# 4. 나머지 이미지들
if [ -f "02-main-dashboard.png" ]; then
    mv "02-main-dashboard.png" "07-main-dashboard.png"
    echo "✓ 02-main-dashboard.png → 07-main-dashboard.png"
fi

if [ -f "03-create-assignment.png" ]; then
    mv "03-create-assignment.png" "08-create-assignment.png"
    echo "✓ 03-create-assignment.png → 08-create-assignment.png"
fi

if [ -f "06-submission-link.png" ]; then
    mv "06-submission-link.png" "09-submission-link.png"
    echo "✓ 06-submission-link.png → 09-submission-link.png"
fi

if [ -f "07-submission-status.png" ]; then
    mv "07-submission-status.png" "10-submission-status.png"
    echo "✓ 07-submission-status.png → 10-submission-status.png"
fi

if [ -f "08-start-evaluation.png" ]; then
    mv "08-start-evaluation.png" "11-start-evaluation.png"
    echo "✓ 08-start-evaluation.png → 11-start-evaluation.png"
fi

if [ -f "09-evaluation-progress.png" ]; then
    mv "09-evaluation-progress.png" "12-evaluation-progress.png"
    echo "✓ 09-evaluation-progress.png → 12-evaluation-progress.png"
fi

if [ -f "10-results-dashboard.png" ]; then
    mv "10-results-dashboard.png" "13-results-dashboard.png"
    echo "✓ 10-results-dashboard.png → 13-results-dashboard.png"
fi

if [ -f "11-individual-report.png" ]; then
    mv "11-individual-report.png" "14-individual-report.png"
    echo "✓ 11-individual-report.png → 14-individual-report.png"
fi

if [ -f "13-export-excel.png" ]; then
    mv "13-export-excel.png" "15-export-excel.png"
    echo "✓ 13-export-excel.png → 15-export-excel.png"
fi

echo ""
echo "파일명 변경이 완료되었습니다!"
echo ""
echo "현재 이미지 파일 목록:"
ls -la *.png | awk '{print "  - " $9}'