# 관리자 대시보드 통계 페이지 수정 이슈 정리

## 이슈 발생일: 2025-07-26

## 1. 초기 요청사항
- **목표**: "Claude 최다 사용자" 통계를 "모델별 채점 최다 사용자" 통계로 변경
- **대상 페이지**: https://bluenote.site/admin/analytics

## 2. 수행한 작업

### 2.1 코드 변경사항
1. **grading 앱 API 추가**
   - 파일: `/apps/grading/src/app/api/stats/users/route.ts`
   - 기능: 모델별(Sonnet/Opus) 사용자 통계 제공

2. **web 앱 프록시 API 추가**
   - 파일: `/apps/web/app/api/admin/grading-user-stats/route.js`
   - 기능: CORS 우회를 위한 프록시 엔드포인트

3. **web 앱 UI 변경**
   - 파일: `/apps/web/app/admin/analytics/AdminAnalyticsClient.js`
   - 변경내용: "Claude 최다 사용자" → "모델별 채점 최다 사용자"
   - 레이아웃: 2열 구조로 Sonnet/Opus 모델별 표시

### 2.2 Git 작업
- 커밋: `f19003e feat: 모델별 채점 최다 사용자 통계 구현`
- GitHub에 정상적으로 push 완료
- 강제 push로 재배포 트리거 시도

## 3. 문제점

### 3.1 프로덕션 반영 안됨
- 코드는 정상적으로 업데이트되었으나 프로덕션에서는 여전히 기존 화면 표시
- 캐시 삭제 후에도 동일한 문제 지속

### 3.2 앱 불일치 발견
- **수정한 앱**: `/apps/web/` (web 앱)
- **실제 배포된 앱**: `/apps/bluenote/` (bluenote 앱)로 추정
- bluenote.site가 어느 앱을 가리키는지 확인 필요

### 3.3 페이지 구조 차이
- 수정한 파일의 UI와 실제 스크린샷의 UI가 완전히 다름
- 스크린샷: 다크 테마, 차트 포함, 다른 레이아웃
- 수정한 파일: 다른 구조의 관리자 대시보드

## 4. 현재 상황

### 4.1 모노레포 구조
```
bluenote-monorepo/
├── apps/
│   ├── bluenote/     # BlueNote Atelier 앱
│   ├── web/          # Web 앱 (수정한 위치)
│   └── grading/      # Grading 앱
```

### 4.2 확인 필요사항
1. **배포 설정**
   - bluenote.site는 실제로 어느 앱을 가리키고 있는가?
   - Vercel 프로젝트 설정 확인 필요

2. **페이지 위치**
   - 스크린샷의 analytics 페이지가 실제로 어느 앱에 있는가?
   - 현재 bluenote 앱에는 analytics 페이지가 없음

3. **앱 간 관계**
   - 각 앱의 용도와 도메인 매핑
   - 올바른 수정 대상 확인

## 5. 해결 방안

### Option 1: bluenote 앱에 analytics 페이지 추가
- `/apps/bluenote/app/admin/analytics/` 디렉토리 생성
- 해당 위치에 수정사항 적용

### Option 2: 배포 설정 확인 후 재작업
- Vercel 대시보드에서 실제 배포 설정 확인
- 올바른 앱 위치 파악 후 재작업

### Option 3: 별도 서비스 확인
- 스크린샷의 페이지가 모노레포 외부의 별도 서비스일 가능성
- 실제 소스 위치 확인 필요

## 6. 다음 단계

1. **Vercel 대시보드 확인**
   - bluenote.site의 실제 배포 소스 확인
   - 빌드 로그 및 배포 설정 검토

2. **올바른 앱 식별**
   - 스크린샷의 UI와 일치하는 소스 코드 위치 찾기
   - 필요시 전체 코드베이스 검색

3. **재작업**
   - 올바른 위치에 동일한 변경사항 적용
   - 테스트 및 배포

## 7. 학습 포인트

- 모노레포 환경에서는 정확한 앱 위치 파악이 중요
- 배포 설정과 도메인 매핑 확인 필수
- UI 스타일과 구조를 통한 앱 식별 필요
- 작업 전 대상 확인 프로세스 중요

---

**작성일**: 2025-07-26  
**작성자**: Claude AI Assistant