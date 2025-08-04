# 사용 안내서 이미지 파일 목록

## 이미지 저장 위치
`/apps/grading/docs/user-guide/images/`

## 필요한 스크린샷 목록

### 1. 시작하기
- **01-bluenote.png**
  - URL: `https://bluenote.site` 메인 페이지
  - 내용: Bluenote 시스템 첫 화면 또는 로고

- **02-login-page.png**
  - URL: `/login` 또는 `/auth/signin`
  - 내용: Google 로그인 버튼이 있는 로그인 페이지

- **03-login-google-1.png**
  - URL: Google OAuth 인증 화면
  - 내용: 구글 계정 선택 화면

- **04-login-google-2.png**
  - URL: Google OAuth 권한 요청
  - 내용: 앱 권한 허용 화면 (Continue 버튼)

- **05-login-google-3.png**
  - URL: Google OAuth 추가 권한
  - 내용: Google Drive 접근 권한 요청 화면

- **06-login-google-4.png**
  - URL: Google OAuth 최종 확인
  - 내용: 권한 허용 최종 확인 화면

- **07-main-dashboard.png**
  - URL: `/assignments`
  - 내용: 과제 목록이 카드 형태로 표시된 메인 화면

### 2. 과제 관리
- **08-create-assignment.png**
  - URL: `/assignments/new`
  - 내용: 과제 생성 폼 (제목, 설명, 기한, 평가 기준 설정)
  - 특히: 상세 프롬프트 자동 생성 기능 버튼 포함

### 3. 학생 글 수집
- **09-submission-link.png**
  - URL: `/assignments/[id]/collect`
  - 내용: 학생용 제출 링크와 QR 코드가 표시된 화면

- **10-submission-status.png**
  - URL: `/assignments/[id]/submissions`
  - 내용: 제출 현황 표시 (제출/미제출 학생 목록)

### 4. 평가 과정
- **11-start-evaluation.png**
  - URL: `/assignments/[id]/evaluate`
  - 내용: AI 평가 시작 화면 (학생 선택 체크박스)

- **12-evaluation-progress.png**
  - URL: `/assignments/[id]/evaluate` (평가 진행 중)
  - 내용: 진행률 표시 바와 현재 평가 중인 학생 표시

### 5. 결과 확인
- **13-results-dashboard.png**
  - URL: `/assignments/[id]/dashboard`
  - 내용: 전체 평가 결과 테이블 (점수, 등급 등)

- **14-individual-report.png**
  - URL: `/student-report/[evaluationId]`
  - 내용: 성장 단계 이미지와 상세 피드백이 있는 개별 리포트

### 6. 내보내기
- **15-export-excel.png**
  - URL: `/assignments/[id]/dashboard` (내보내기 버튼 클릭)
  - 내용: Excel 내보내기 옵션 (포함할 데이터 선택)

- **16-generate-pdf.png**
  - URL: `/student-report/[evaluationId]`
  - 내용: PDF 다운로드 버튼이 보이는 개별 리포트
  - 참고: "(예정)" 표시 포함

- **17-bulk-download.png**
  - URL: `/assignments/[id]/dashboard`
  - 내용: 여러 학생 선택 후 일괄 다운로드 옵션
  - 참고: "(예정)" 표시 포함

### 7. 기타
- **18-error-messages.png**
  - 내용: 주요 오류 메시지 예시 (권한 없음, 네트워크 오류 등)

## 이미지 번호 체계
- 01-06: 로그인 과정
- 07: 메인 대시보드
- 08: 과제 생성
- 09-10: 제출 관련
- 11-12: 평가 과정
- 13-14: 결과 확인
- 15-17: 내보내기
- 18: 오류 메시지

## 스크린샷 촬영 가이드

1. **브라우저 설정**
   - 전체 화면이 아닌 적당한 크기로 조정
   - 확대/축소 비율 100%
   - 불필요한 브라우저 확장 프로그램 숨기기

2. **데이터 준비**
   - 테스트용 과제와 학생 데이터 사용
   - 민감한 개인정보는 가림 처리
   - 대표적인 예시가 될 만한 데이터 선택

3. **촬영 팁**
   - 중요한 UI 요소가 잘 보이도록 촬영
   - 마우스 커서는 제외
   - 팝업이나 드롭다운 메뉴는 열린 상태로 촬영
   - Google OAuth 화면은 개인정보를 가린 상태로 촬영

## 특별 주의사항

1. **로그인 과정 (03-06)**
   - 연구용 인증 과정의 각 단계를 명확히 보여줄 것
   - Continue 버튼이 잘 보이도록 촬영

2. **과제 생성 (08)**
   - "상세 프롬프트 자동 생성" 기능이 잘 보이도록 촬영
   - 3~5개의 평가 기준 예시 포함

3. **제출 링크 (09)**
   - QR 코드가 포함된 화면 촬영

4. **예정 기능 표시**
   - PDF 생성과 일괄 다운로드는 "(예정)" 표시가 보이도록

## PDF 변환 시 고려사항

- 이미지 해상도: 최소 150 DPI
- 파일 크기: 각 이미지당 1MB 이하 권장
- 형식: PNG 권장 (투명 배경 불필요)
- 총 이미지 수: 18개