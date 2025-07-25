# PDF 변환 가이드

## 변환 방법

### 방법 1: Markdown to PDF (추천)
1. VS Code에서 "Markdown PDF" 확장 프로그램 설치
2. USER_GUIDE.md 파일 열기
3. Cmd+Shift+P → "Markdown PDF: Export (pdf)" 선택

### 방법 2: Pandoc 사용
```bash
# Pandoc 설치 (Mac)
brew install pandoc

# PDF 변환 (한글 폰트 지원)
pandoc USER_GUIDE.md -o USER_GUIDE.pdf \
  --pdf-engine=xelatex \
  -V mainfont="Noto Sans KR" \
  -V geometry:margin=2cm \
  --toc \
  --highlight-style=tango
```

### 방법 3: 웹 브라우저 사용
1. Markdown 뷰어나 GitHub에서 USER_GUIDE.md 열기
2. 인쇄 (Cmd+P)
3. "PDF로 저장" 선택

## 이미지 처리

스크린샷을 모두 촬영한 후:

1. 이미지를 `/apps/grading/docs/user-guide/images/` 폴더에 저장
2. 파일명은 IMAGE_LIST.md에 명시된 대로 저장
3. 필요시 이미지 최적화:
   ```bash
   # ImageMagick으로 크기 조정
   convert input.png -resize 1200x -quality 85 output.png
   ```

## 최종 PDF 최적화

PDF 생성 후 파일 크기를 줄이려면:

```bash
# Ghostscript 사용
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

## 체크리스트

- [ ] 모든 이미지 파일 준비 완료
- [ ] 이미지 경로 확인
- [ ] 민감한 정보 마스킹 확인
- [ ] PDF 변환 테스트
- [ ] 목차 링크 작동 확인
- [ ] 페이지 레이아웃 확인
- [ ] 최종 파일 크기 확인 (10MB 이하 권장)