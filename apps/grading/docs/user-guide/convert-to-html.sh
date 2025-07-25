#!/bin/bash

echo "Markdown을 HTML로 변환 중..."

# HTML 템플릿 생성
cat > USER_GUIDE.html << 'EOF'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 글쓰기 평가 시스템 사용 안내서</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        
        h2 {
            color: #34495e;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-left: 10px;
            border-left: 4px solid #3498db;
        }
        
        h3 {
            color: #7f8c8d;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        /* 이미지 스타일 */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* 테이블 스타일 */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #f4f4f4;
            font-weight: 500;
        }
        
        /* 코드 블록 */
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
        }
        
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        
        /* 인용구 스타일 */
        blockquote {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        
        blockquote p {
            margin: 0;
        }
        
        /* 목차 스타일 */
        #목차 + ul {
            background-color: #f9f9f9;
            padding: 20px 30px;
            border-radius: 5px;
            list-style-type: none;
        }
        
        #목차 + ul li {
            margin: 10px 0;
        }
        
        #목차 + ul a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        
        #목차 + ul a:hover {
            text-decoration: underline;
        }
        
        /* 알림 박스 */
        .notice {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 500;
        }
        
        /* 팁 박스 스타일 */
        blockquote:has(p:first-child:contains("💡")) {
            background-color: #e8f5e9;
            border-left-color: #4caf50;
        }
        
        /* 경고 박스 스타일 */
        blockquote:has(p:first-child:contains("⚠️")) {
            background-color: #fff3e0;
            border-left-color: #ff9800;
        }
        
        /* 리스트 스타일 */
        ul, ol {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        /* 링크 스타일 */
        a {
            color: #3498db;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* 수평선 */
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 40px 0;
        }
        
        /* 이미지 캡션 */
        p > em {
            display: block;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: -10px;
            margin-bottom: 20px;
        }
        
        /* 프린트 스타일 */
        @media print {
            body {
                background-color: white;
            }
            
            .container {
                box-shadow: none;
                padding: 0;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
            
            img {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
EOF

# pandoc을 사용하여 Markdown을 HTML로 변환
if command -v pandoc &> /dev/null; then
    pandoc USER_GUIDE.md -f markdown -t html >> USER_GUIDE.html
else
    echo "pandoc이 설치되지 않았습니다. 설치해주세요: brew install pandoc"
    exit 1
fi

# HTML 템플릿 닫기
cat >> USER_GUIDE.html << 'EOF'
    </div>
</body>
</html>
EOF

echo "✓ HTML 변환 완료: USER_GUIDE.html"

# PDF 변환을 위한 wkhtmltopdf 확인
if command -v wkhtmltopdf &> /dev/null; then
    echo "PDF로 변환 중..."
    wkhtmltopdf --enable-local-file-access \
                --margin-top 20mm \
                --margin-bottom 20mm \
                --margin-left 20mm \
                --margin-right 20mm \
                --page-size A4 \
                --encoding UTF-8 \
                USER_GUIDE.html USER_GUIDE.pdf
    echo "✓ PDF 변환 완료: USER_GUIDE.pdf"
else
    echo "wkhtmltopdf가 설치되지 않았습니다."
    echo "PDF 변환을 위해 다음 명령으로 설치해주세요:"
    echo "  brew install --cask wkhtmltopdf"
fi