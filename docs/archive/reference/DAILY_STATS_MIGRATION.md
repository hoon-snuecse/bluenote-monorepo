# Daily Stats 마이그레이션 가이드

## 개요
관리자 대시보드의 성능 개선을 위해 일별 통계를 사전 집계하는 `daily_stats` 테이블을 도입합니다.

## 현재 상황
- **7일간 활동 데이터**:
  - 2025-07-25: 로그인 23회 (3명), Claude 사용 1회, 게시물 작성 로그 1회
  - 2025-07-26: 로그인 2회 (1명)
  - 나머지 날짜: 활동 없음
- **게시물**: 최근 7일간 새 게시물 없음

## 마이그레이션 단계

### 1단계: 테이블 생성
```bash
# Supabase SQL Editor에서 실행
# 파일: migrations/create_daily_stats_table.sql
```

### 2단계: 기존 데이터 마이그레이션
```bash
# Supabase SQL Editor에서 실행
# 파일: migrations/migrate_daily_stats_data.sql
```

### 3단계: 자동 업데이트 트리거 설치
```bash
# Supabase SQL Editor에서 실행
# 파일: migrations/create_daily_stats_triggers.sql
```

### 4단계: API 전환
```javascript
// 현재: /api/admin/analytics-minimal (임시)
// 마이그레이션 후: /api/admin/analytics-v2 (daily_stats 기반)

// AdminAnalyticsOptimized.js 수정
const response = await fetch('/api/admin/analytics-v2');
```

## 테이블 구조
```sql
daily_stats
├── date (PRIMARY KEY)
├── login_count
├── unique_login_count
├── claude_usage_count
├── post_write_count
├── research_post_count
├── teaching_post_count
├── analytics_post_count
├── shed_post_count
├── total_post_count
├── grading_sonnet_count
├── grading_opus_count
└── timestamps
```

## 성능 개선
- **Before**: 1000+ 로그 레코드 조회 → JavaScript 집계
- **After**: 7개 daily_stats 레코드 직접 조회
- **응답 시간**: 500ms+ → 50ms 이하

## 검증 방법
```sql
-- 마이그레이션 후 데이터 확인
SELECT * FROM daily_stats 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

## 주의사항
1. 트리거는 INSERT 시에만 작동 (UPDATE, DELETE는 고려하지 않음)
2. unique_login_count는 매번 재계산 (중복 제거 필요)
3. 과거 데이터 수정 시 수동으로 daily_stats 업데이트 필요

## 롤백 계획
```sql
-- 문제 발생 시
DROP TABLE daily_stats CASCADE;
-- API를 analytics-minimal로 되돌리기
```