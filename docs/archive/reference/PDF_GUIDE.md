# PDF 변환 가이드

## HTML을 PDF로 변환하는 방법

### 방법 1: 웹 브라우저 사용 (권장)

1. **Chrome 또는 Safari에서 `USER_GUIDE_embedded.html` 파일 열기**
   - 파일을 더블클릭하거나
   - 브라우저에 드래그 앤 드롭

2. **인쇄 대화상자 열기**
   - Mac: `Cmd + P`
   - Windows: `Ctrl + P`

3. **PDF 설정**
   - 대상: "PDF로 저장" 선택
   - 용지 크기: A4
   - 여백: 기본값 또는 사용자 정의 (20mm 권장)
   - 배경 그래픽: ✓ 체크 (이미지와 색상을 포함하려면)
   - 머리글과 바닥글: 체크 해제

4. **저장**
   - "저장" 버튼 클릭
   - 파일명: `AI_글쓰기_평가_시스템_사용안내서.pdf`

### 방법 2: 온라인 변환 도구

1. **웹사이트 접속**
   - https://www.ilovepdf.com/html-to-pdf
   - https://cloudconvert.com/html-to-pdf

2. **파일 업로드**
   - `USER_GUIDE_embedded.html` 파일 선택

3. **변환 및 다운로드**

### 방법 3: 명령줄 도구 (고급 사용자)

```bash
# wkhtmltopdf 설치 (Mac)
brew install --cask wkhtmltopdf

# PDF 변환
wkhtmltopdf --enable-local-file-access \
            --margin-top 20mm \
            --margin-bottom 20mm \
            --margin-left 20mm \
            --margin-right 20mm \
            --page-size A4 \
            --encoding UTF-8 \
            USER_GUIDE_embedded.html \
            USER_GUIDE.pdf
```

## 생성된 파일 정보

- **USER_GUIDE_embedded.html**: 모든 이미지가 포함된 독립 실행형 HTML (35.8 MB)
  - 이미지 18개가 Base64로 인코딩되어 포함
  - 인터넷 연결 없이도 열람 가능
  - 어디서든 공유 가능한 단일 파일

## 팁

- PDF 파일 크기를 줄이려면 PDF 압축 도구 사용
- 인쇄 미리보기에서 페이지 나눔 확인
- 배경색이 필요 없다면 "배경 그래픽" 체크 해제