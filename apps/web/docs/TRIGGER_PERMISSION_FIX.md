# 트리거 권한 문제 해결 가이드

## 문제 상황
- **증상**: 글 작성/수정/삭제 시 "permission denied for table daily_stats" 오류 발생
- **원인**: 트리거 함수가 일반 사용자 권한으로 실행되어 `daily_stats` 테이블 업데이트 실패

## 해결 방법

### 1. Supabase SQL Editor에서 실행
```sql
-- migrations/fix_triggers_security_definer.sql 파일 내용 실행
```

### 2. 핵심 변경사항
트리거 함수에 다음 옵션 추가:
- `SECURITY DEFINER`: 함수를 생성자(슈퍼유저) 권한으로 실행
- `SET search_path = public`: 스키마 경로 명시적 설정

## 영향받는 테이블
- `research_posts` - 연구 게시판
- `teaching_posts` - 교육 게시판  
- `analytics_posts` - 분석 게시판
- `shed_posts` - 창고 게시판
- `usage_logs` - 사용 로그

## 보안 고려사항
- `SECURITY DEFINER`는 필요한 최소한의 함수에만 적용
- `search_path`를 명시하여 스키마 인젝션 방지
- 트리거는 자동 통계 업데이트만 수행 (사용자 데이터 접근 없음)

## 테스트 방법
1. 각 게시판에서 글 작성 테스트
2. 글 수정 테스트
3. 글 삭제 테스트
4. `daily_stats` 테이블에서 카운트 증가 확인

## 롤백 방법
필요시 `SECURITY DEFINER` 없는 원본 함수로 재생성