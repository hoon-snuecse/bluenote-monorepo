#!/bin/bash

echo "이미지가 포함된 HTML 파일 생성 중..."

# Base64로 이미지 인코딩하는 함수
encode_image() {
    local img_path=$1
    local img_name=$(basename "$img_path")
    
    if [ -f "$img_path" ]; then
        echo "data:image/png;base64,$(base64 -i "$img_path" | tr -d '\n')"
    else
        echo ""
    fi
}

# 이미지 디렉토리 경로
IMG_DIR="./images"

# HTML 파일 시작
cat > USER_GUIDE_embedded.html << 'EOF'
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
            line-height: 1.8;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            background-color: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        h2 {
            color: #34495e;
            margin-top: 50px;
            margin-bottom: 25px;
            padding-left: 15px;
            border-left: 5px solid #3498db;
            font-size: 1.8em;
        }
        
        h3 {
            color: #5d6d7e;
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        
        /* 목차 스타일 */
        ul:first-of-type {
            background-color: #f8f9fa;
            padding: 30px 40px;
            border-radius: 8px;
            list-style: none;
            margin-bottom: 40px;
        }
        
        ul:first-of-type li {
            margin: 10px 0;
            font-size: 1.1em;
        }
        
        ul:first-of-type a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        
        ul:first-of-type a:hover {
            text-decoration: underline;
        }
        
        /* 일반 리스트 스타일 */
        ul, ol {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        
        li {
            margin-bottom: 10px;
            line-height: 1.8;
        }
        
        /* 강조 텍스트 */
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        /* 코드 스타일 */
        code {
            background-color: #f4f4f4;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.95em;
        }
        
        /* 인용구 스타일 */
        blockquote {
            background-color: #e8f5e9;
            border-left: 5px solid #4caf50;
            padding: 20px 25px;
            margin: 25px 0;
            border-radius: 5px;
        }
        
        blockquote p {
            margin: 0;
            font-style: italic;
        }
        
        /* 이미지 스타일 */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 25px auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        /* 이미지 캡션 */
        div > p[style*="font-size: 0.9em"] {
            text-align: center;
            color: #666;
            font-style: italic;
            margin-top: -15px;
            margin-bottom: 30px;
        }
        
        /* 테이블 스타일 */
        table {
            border-collapse: collapse;
            margin: 25px 0;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        td {
            padding: 10px;
            vertical-align: top;
        }
        
        /* 알림 박스 */
        .notice {
            background-color: #e3f2fd;
            border: 2px solid #2196f3;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 500;
            color: #1565c0;
        }
        
        /* 수평선 */
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 50px 0;
        }
        
        /* 프린트 스타일 */
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                padding: 20px;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
            
            img {
                page-break-inside: avoid;
                max-width: 60% !important;
            }
            
            blockquote {
                page-break-inside: avoid;
            }
        }
        
        /* 모바일 반응형 */
        @media (max-width: 768px) {
            .container {
                padding: 30px 20px;
            }
            
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.2em; }
            
            img {
                max-width: 100% !important;
            }
            
            table {
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
EOF

# Markdown 내용을 읽어서 이미지 경로를 Base64로 변환
echo "Markdown 파일 처리 중..."

# USER_GUIDE.md 파일 읽기 및 처리
while IFS= read -r line; do
    # 이미지 태그 찾기 및 변환
    if [[ $line =~ src=\"\./images/([^\"]+)\" ]]; then
        img_file="${BASH_REMATCH[1]}"
        img_path="$IMG_DIR/$img_file"
        
        if [ -f "$img_path" ]; then
            echo "  이미지 인코딩 중: $img_file"
            base64_data=$(encode_image "$img_path")
            if [ -n "$base64_data" ]; then
                line=${line//src=\".\/images\/$img_file\"/src=\"$base64_data\"}
            fi
        fi
    fi
    
    # HTML 변환
    # 제목 변환
    if [[ $line =~ ^#[[:space:]](.+) ]]; then
        echo "<h1>${BASH_REMATCH[1]}</h1>" >> USER_GUIDE_embedded.html
    elif [[ $line =~ ^##[[:space:]](.+) ]]; then
        echo "<h2>${BASH_REMATCH[1]}</h2>" >> USER_GUIDE_embedded.html
    elif [[ $line =~ ^###[[:space:]](.+) ]]; then
        echo "<h3>${BASH_REMATCH[1]}</h3>" >> USER_GUIDE_embedded.html
    # 강조 표시 (notice)
    elif [[ $line =~ ^\*\*\[(.+)\]\*\* ]]; then
        echo "<div class=\"notice\">${BASH_REMATCH[1]}</div>" >> USER_GUIDE_embedded.html
    # 수평선
    elif [[ $line == "---" ]]; then
        echo "<hr>" >> USER_GUIDE_embedded.html
    # 빈 줄
    elif [[ -z $line ]]; then
        echo "" >> USER_GUIDE_embedded.html
    # 리스트 항목
    elif [[ $line =~ ^-[[:space:]](.+) ]]; then
        echo "<li>${BASH_REMATCH[1]}</li>" >> USER_GUIDE_embedded.html
    elif [[ $line =~ ^[0-9]+\.[[:space:]](.+) ]]; then
        echo "<li>${BASH_REMATCH[1]}</li>" >> USER_GUIDE_embedded.html
    # 인용구
    elif [[ $line =~ ^\>[[:space:]](.+) ]]; then
        echo "<blockquote><p>${BASH_REMATCH[1]}</p></blockquote>" >> USER_GUIDE_embedded.html
    # 그 외 (일반 텍스트, div, table 등)
    else
        echo "$line" >> USER_GUIDE_embedded.html
    fi
done < USER_GUIDE.md

# HTML 파일 마무리
cat >> USER_GUIDE_embedded.html << 'EOF'
    </div>
</body>
</html>
EOF

echo "✓ 이미지가 포함된 HTML 파일 생성 완료: USER_GUIDE_embedded.html"
echo "  파일 크기: $(du -h USER_GUIDE_embedded.html | cut -f1)"
echo ""
echo "이 파일은 모든 이미지가 포함되어 있어 인터넷 연결 없이도 볼 수 있습니다."